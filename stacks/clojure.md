# Clojure Specific Rules

> Stack: Clojure + Ring/Compojure + JDBC/HugSQL + PostgreSQL
> Variant: Functional programming, immutable data, REPL-driven development

## Project Structure

```
project/
├── src/
│   └── project/
│       ├── core.clj          # Entry point
│       ├── handler.clj       # Ring handlers
│       ├── routes.clj        # Compojure routes
│       ├── db/
│       │   ├── core.clj      # Database connection
│       │   └── queries.sql   # HugSQL queries
│       └── models/
│           └── user.clj      # Domain logic
├── resources/
│   ├── config.edn            # Configuration
│   └── migrations/           # Database migrations
├── test/
│   └── project/
│       └── handler_test.clj
└── project.clj               # Dependencies
```

## Core Principles

```clojure
(ns project.core
  (:require [ring.adapter.jetty :as jetty]
            [project.handler :refer [app]]
            [environ.core :refer [env]]
            [clojure.tools.logging :as log])
  (:gen-class))

(defn -main
  "Application entry point.
  
  ASSUMPTIONS:
  - PORT from environment (default 3000)
  - DATABASE_URL for PostgreSQL connection
  - Logging configured for production"
  [& args]
  (let [port (Integer/parseInt (or (env :port) "3000"))]
    (log/info "Starting server on port" port)
    (jetty/run-jetty app {:port port :join? false})))
```

## Ring Handlers

```clojure
(ns project.handler
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.middleware.json :refer [wrap-json-body wrap-json-response]]
            [ring.middleware.params :refer [wrap-params]]
            [ring.middleware.keyword-params :refer [wrap-keyword-params]]
            [project.routes :refer [api-routes]]
            [project.middleware :refer [wrap-auth wrap-rate-limit wrap-cors]])

(def app
  (-> api-routes
      (wrap-json-body {:keywords? true})
      wrap-json-response
      wrap-keyword-params
      wrap-params
      wrap-auth
      wrap-rate-limit
      wrap-cors))
```

## Routes & Handlers

```clojure
(ns project.routes
  (:require [compojure.core :refer :all]
            [project.controllers.user :as user]
            [project.middleware :refer [require-auth]]
            [ring.util.response :as response]))

(defroutes api-routes
  (GET "/health" []
    {:status 200
     :body {:status "healthy"
            :version "1.0.0"}})
  
  (context "/api/v1" []
    (POST "/login" [] user/login)
    (POST "/register" [] user/register)
    
    (context "/users" []
      (GET "/" [] (require-auth user/list))
      (POST "/" [] (require-auth user/create))
      (GET "/:id" [id] (require-auth (partial user/show id)))
      (PUT "/:id" [id] (require-auth (partial user/update id)))
      (DELETE "/:id" [id] (require-auth (partial user/delete id)))))
  
  (route/not-found
    {:error "Not found"}))
```

## Controllers

```clojure
(ns project.controllers.user
  (:require [project.models.user :as user]
            [project.db.core :as db]
            [project.auth :as auth]
            [ring.util.response :as response]
            [clojure.spec.alpha :as s]
            [clojure.tools.logging :as log]))

(s/def ::email (s/and string? #(re-matches #"[^\s]+@[^\s]+" %)))
(s/def ::password (s/and string? #(>= (count %) 8)))
(s/def ::name (s/and string? #(>= (count %) 2)))

(s/def ::user-create
  (s/keys :req-un [::email ::password ::name]))

(defn create
  "Create a new user.
  
  SECURITY NOTE:
  - Password hashed with bcrypt
  - Email normalized (downcased)
  - Input validated with clojure.spec"
  [request]
  (let [user-data (:body-params request)]
    (if (s/valid? ::user-create user-data)
      (try
        (let [user (user/create! db/*db* user-data)]
          (response/created (str "/api/v1/users/" (:id user))
                           {:data user}))
        (catch Exception e
          (log/error e "Failed to create user")
          {:status 500
           :body {:error "Failed to create user"}}))
      {:status 400
       :body {:error "Invalid input"
              :details (s/explain-data ::user-create user-data)}})))

(defn login
  "Authenticate user and return JWT.
  
  ASSUMPTIONS:
  - Token expires in 24 hours
  - Rate limiting applied at middleware level"
  [request]
  (let [{:keys [email password]} (:body-params request)]
    (if-let [user (user/authenticate db/*db* email password)]
      {:status 200
       :body {:token (auth/generate-token user)
              :user (select-keys user [:id :email :name])}}
      {:status 401
       :body {:error "Invalid credentials"}})))

(defn list
  "List users with pagination.
  
  ASSUMPTIONS:
  - Users see only their own data (unless admin)
  - Max 100 results per page"
  [request]
  (let [current-user (:identity request)
        page (Integer/parseInt (get-in request [:query-params :page] "1"))
        per-page (min 100 (Integer/parseInt (get-in request [:query-params :per-page] "20")))]
    {:status 200
     :body {:data (user/list-by-owner db/*db* (:id current-user) page per-page)
            :meta {:page page :per-page per-page}}}))
```

## Models

```clojure
(ns project.models.user
  (:require [project.db.core :as db]
            [buddy.hashers.bcrypt :as bcrypt]
            [clojure.string :as str]
            [clojure.tools.logging :as log]))

(defn create!
  "Create user with password hashing.
  
  ASSUMPTIONS:
  - Email uniqueness enforced at DB level
  - Password meets complexity requirements"
  [db user-data]
  (let [normalized-email (-> user-data :email str/lower-case str/trim)
        hashed-password (bcrypt/encrypt (:password user-data) {:work-factor 12})]
    (db/insert-user db
                    {:email normalized-email
                     :password_hash hashed-password
                     :name (:name user-data)
                     :created_at (java.time.Instant/now)})))

(defn authenticate
  "Verify credentials.
  
  SECURITY NOTE:
  - Constant-time comparison to prevent timing attacks
  - Account lockout after 5 failed attempts (enforced elsewhere)"
  [db email password]
  (when-let [user (db/find-user-by-email db (str/lower-case email))]
    (when (and (:active user)
               (bcrypt/check password (:password_hash user)))
      user)))

(defn list-by-owner
  "List users for given owner with pagination.
  
  ASSUMPTIONS:
  - Soft-deleted users excluded by query"
  [db owner-id page per-page]
  (db/list-users-by-owner db owner-id (* (dec page) per-page) per-page))
```

## Database

```clojure
;; resources/queries.sql
-- :name insert-user :insert :*
-- :doc Insert new user
INSERT INTO users (email, password_hash, name, created_at, active)
VALUES (:email, :password_hash, :name, :created_at, true)
RETURNING id, email, name, created_at, active

-- :name find-user-by-email :? :1
-- :doc Find user by email
SELECT id, email, password_hash, name, created_at, active
FROM users
WHERE email = :email AND deleted_at IS NULL

-- :name list-users-by-owner :query :many
-- :doc List users with pagination
SELECT id, email, name, created_at, active
FROM users
WHERE owner_id = :owner_id AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT :limit OFFSET :offset

-- :name soft-delete-user :update :n
-- :doc Soft delete user
UPDATE users
SET deleted_at = NOW(), active = false
WHERE id = :id
```

## Middleware

```clojure
(ns project.middleware
  (:require [ring.util.response :as response]
            [clojure.string :as str]
            [buddy.auth :refer [authenticated?]]
            [buddy.auth.backends.token :refer [jws-backend]]
            [buddy.auth.middleware :refer [wrap-authentication wrap-authorization]]
            [environ.core :refer [env]]
            [clojure.tools.logging :as log]))

(defn wrap-auth
  "Add authentication middleware.
  
  SECURITY NOTE:
  - JWT validation with secret from environment
  - Tokens validated on every request"
  [handler]
  (let [backend (jws-backend {:secret (env :jwt-secret)
                               :token-name "Bearer"
                               :options {:alg :hs512}})]
    (wrap-authentication handler backend)))

(defn require-auth
  "Require authentication for route.
  
  ASSUMPTIONS:
  - :identity set by wrap-auth
  - Returns 401 if not authenticated"
  [handler]
  (fn [request]
    (if (authenticated? request)
      (handler request)
      {:status 401
       :body {:error "Authentication required"}})))

(defn wrap-rate-limit
  "Simple rate limiting.
  
  ASSUMPTIONS:
  - In-memory storage (use Redis in production)
  - 100 requests per minute per IP"
  [handler]
  (let [requests (atom {})]
    (fn [request]
      (let [ip (:remote-addr request)
            now (System/currentTimeMillis)
            window (* 60 1000)  ; 1 minute
            max-requests 100]
        (swap! requests update ip
               (fn [timestamps]
                 (->> (or timestamps [])
                      (filter #(> (- now %) window))
                      (cons now))))
        (if (<= (count (get @requests ip)) max-requests)
          (handler request)
          {:status 429
           :headers {"Retry-After" "60"}
           :body {:error "Rate limit exceeded"}})))))

(defn wrap-cors
  "CORS headers.
  
  SECURITY NOTE:
  - Origins configured via environment
  - Credentials allowed for authenticated requests"
  [handler]
  (fn [request]
    (let [response (handler request)
          allowed-origins (set (str/split (env :cors-origins "http://localhost:3000") #","))]
      (if-let [origin (get-in request [:headers "origin"])]
        (if (contains? allowed-origins origin)
          (-> response
              (assoc-in [:headers "Access-Control-Allow-Origin"] origin)
              (assoc-in [:headers "Access-Control-Allow-Credentials"] "true")
              (assoc-in [:headers "Access-Control-Allow-Methods"] "GET, POST, PUT, DELETE, OPTIONS")
              (assoc-in [:headers "Access-Control-Allow-Headers"] "Authorization, Content-Type"))
          response)
        response))))
```

## Testing

```clojure
(ns project.handler-test
  (:require [clojure.test :refer :all]
            [ring.mock.request :as mock]
            [project.handler :refer [app]]
            [project.db.core :as db]
            [cheshire.core :as json]))

(deftest health-check-test
  (testing "health endpoint"
    (let [response (app (mock/request :get "/health"))]
      (is (= 200 (:status response)))
      (is (= "healthy" (get-in (json/parse-string (:body response) true) [:status]))))))

(deftest user-creation-test
  (testing "create user with valid data"
    (let [response (app (-> (mock/request :post "/api/v1/register")
                            (mock/json-body {:email "test@example.com"
                                             :password "SecurePass123"
                                             :name "Test User"})))]
      (is (= 201 (:status response)))))
  
  (testing "reject invalid email"
    (let [response (app (-> (mock/request :post "/api/v1/register")
                            (mock/json-body {:email "invalid"
                                             :password "SecurePass123"
                                             :name "Test User"})))]
      (is (= 400 (:status response)))))
  
  (testing "reject weak password"
    (let [response (app (-> (mock/request :post "/api/v1/register")
                            (mock/json-body {:email "test@example.com"
                                             :password "weak"
                                             :name "Test User"})))]
      (is (= 400 (:status response))))))

(deftest authentication-test
  (testing "login with valid credentials"
    ;; Setup: Create user first
    (app (-> (mock/request :post "/api/v1/register")
             (mock/json-body {:email "login@test.com"
                              :password "SecurePass123"
                              :name "Login User"})))
    
    (let [response (app (-> (mock/request :post "/api/v1/login")
                            (mock/json-body {:email "login@test.com"
                                             :password "SecurePass123"})))]
      (is (= 200 (:status response)))
      (is (string? (get-in (json/parse-string (:body response) true) [:token])))))
  
  (testing "reject invalid credentials"
    (let [response (app (-> (mock/request :post "/api/v1/login")
                            (mock/json-body {:email "wrong@test.com"
                                             :password "WrongPass123"})))]
      (is (= 401 (:status response))))))
```

## Security Checklist

- [ ] Secrets in environment variables (config.edn)
- [ ] HTTPS in production
- [ ] CORS origins explicitly configured
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (ring-json auto-escaping)
- [ ] Bcrypt password hashing (work factor 12+)
- [ ] JWT tokens with expiration
- [ ] Rate limiting on auth endpoints
- [ ] Input validation with clojure.spec
- [ ] Authentication on all protected routes
- [ ] Audit logging for sensitive operations

## SUMMARY

Clojure stack:
1. Pure functions and immutable data
2. REPL-driven development
3. Ring/Compojure for web
4. HugSQL for type-safe SQL
5. clojure.spec for validation
6. Buddy for security
7. Component/System for lifecycle
8. Comprehensive clojure.test coverage
