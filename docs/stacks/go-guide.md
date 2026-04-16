# Go Guide: Deep Dive

Comprehensive guide for using From One to Sixty-Seven with Go projects.

---

## Go-Specific Rules

### Error Handling

**Rule:** Always check errors, never ignore them.

**Compliant:**
```go
// Check and handle every error
func processFile(filename string) error {
    f, err := os.Open(filename)
    if err != nil {
        return fmt.Errorf("opening file: %w", err)
    }
    defer f.Close()

    data, err := io.ReadAll(f)
    if err != nil {
        return fmt.Errorf("reading file: %w", err)
    }

    if err := processData(data); err != nil {
        return fmt.Errorf("processing data: %w", err)
    }

    return nil
}

// Error with context
func getUser(ctx context.Context, id string) (*User, error) {
    user, err := db.GetUser(ctx, id)
    if err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            return nil, fmt.Errorf("user %s not found: %w", id, ErrNotFound)
        }
        return nil, fmt.Errorf("fetching user %s: %w", id, err)
    }
    return user, nil
}
```

**Violation:**
```go
// Ignoring error!
f, _ := os.Open(filename)  // Dangerous!

// Or silently continuing
f, err := os.Open(filename)
if err != nil {
    log.Println(err)  // Logged but not handled
}
// f might be nil, but we continue using it
```

### Context Propagation

**Rule:** Pass context.Context as first parameter to all functions that need it.

**Compliant:**
```go
// Function accepts context
func fetchUser(ctx context.Context, userID string) (*User, error) {
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()

    return db.GetUser(ctx, userID)
}

// HTTP handler
func handleGetUser(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    
    user, err := fetchUser(ctx, r.PathValue("id"))
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    json.NewEncoder(w).Encode(user)
}

// Background task
func processBatch(ctx context.Context) error {
    for _, item := range items {
        select {
        case <-ctx.Done():
            return ctx.Err()
        default:
            if err := processItem(ctx, item); err != nil {
                return err
            }
        }
    }
    return nil
}
```

**Violation:**
```go
// No context - can't cancel or timeout
func fetchUser(userID string) (*User, error) {
    return db.GetUser(userID)  // No way to cancel!
}
```

### Struct Tags and Validation

**Compliant:**
```go
type User struct {
    ID        string    `json:"id" db:"user_id"`
    Email     string    `json:"email" validate:"required,email"`
    Name      string    `json:"name,omitempty" validate:"max=100"`
    CreatedAt time.Time `json:"created_at" db:"created_at"`
    IsActive  bool      `json:"is_active" db:"is_active"`
}

// Validation
func validateUser(u *User) error {
    validate := validator.New()
    if err := validate.Struct(u); err != nil {
        return fmt.Errorf("validation failed: %w", err)
    }
    return nil
}
```

### Interface Design

**Rule:** Small, focused interfaces. Let consumers define what they need.

**Compliant:**
```go
// Small, focused interfaces
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

type Closer interface {
    Close() error
}

// Composed interfaces
type ReadWriter interface {
    Reader
    Writer
}

type ReadWriteCloser interface {
    Reader
    Writer
    Closer
}

// Consumer defines interface
type UserRepository interface {
    Get(ctx context.Context, id string) (*User, error)
    Create(ctx context.Context, u *User) error
    Update(ctx context.Context, u *User) error
    Delete(ctx context.Context, id string) error
}

// Can swap implementations: SQL, Redis, mock
type SQLUserRepository struct {
    db *sql.DB
}

func (r *SQLUserRepository) Get(ctx context.Context, id string) (*User, error) {
    // Implementation
}
```

**Violation:**
```go
// Large interface - hard to implement
type Database interface {
    Connect() error
    Disconnect() error
    Query(ctx context.Context, sql string, args ...interface{}) (*Rows, error)
    Exec(ctx context.Context, sql string, args ...interface{}) (Result, error)
    BeginTx(ctx context.Context) (*Tx, error)
    // ... 20 more methods
}
```

---

## Project Structure

### Standard Layout

```
myproject/
├── cmd/
│   ├── server/              # Main application
│   │   └── main.go
│   └── worker/              # Another binary
│       └── main.go
├── internal/                # Private application code
│   ├── domain/              # Business logic
│   │   ├── user.go
│   │   └── order.go
│   ├── repository/          # Data access
│   │   ├── user_repo.go
│   │   └── order_repo.go
│   ├── service/             # Business services
│   │   ├── user_service.go
│   │   └── order_service.go
│   └── handler/             # HTTP handlers
│       ├── user_handler.go
│       └── order_handler.go
├── pkg/                     # Public library code
│   └── utils/
│       └── validators.go
├── api/                     # API definitions
│   └── openapi.yaml
├── web/                     # Web assets (if any)
├── configs/                 # Configuration files
├── deployments/             # Docker, k8s configs
├── scripts/                 # Build scripts
├── go.mod
├── go.sum
├── Makefile
└── README.md
```

### Key Files

**go.mod:**
```go
module github.com/myorg/myproject

go 1.21

require (
    github.com/go-chi/chi/v5 v5.0.10
    github.com/jackc/pgx/v5 v5.5.0
    github.com/redis/go-redis/v9 v9.3.0
    go.uber.org/zap v1.26.0
)
```

**Makefile:**
```makefile
.PHONY: build test lint clean

build:
	go build -o bin/server ./cmd/server

test:
	go test -v -race -coverprofile=coverage.out ./...

lint:
	golangci-lint run

clean:
	rm -rf bin/

run:
	go run ./cmd/server
```

---

## HTTP Server Patterns

### Chi Router

```go
package main

import (
    "net/http"
    "time"

    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
)

func main() {
    r := chi.NewRouter()

    // Middleware
    r.Use(middleware.RequestID)
    r.Use(middleware.RealIP)
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)
    r.Use(middleware.Timeout(60 * time.Second))

    // Health check
    r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("ok"))
    })

    // API routes
    r.Route("/api", func(r chi.Router) {
        r.Route("/users", func(r chi.Router) {
            r.Get("/", listUsers)
            r.Post("/", createUser)
            r.Get("/{id}", getUser)
            r.Put("/{id}", updateUser)
            r.Delete("/{id}", deleteUser)
        })
    })

    http.ListenAndServe(":8080", r)
}

func getUser(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    id := chi.URLParam(r, "id")

    user, err := userService.Get(ctx, id)
    if err != nil {
        if errors.Is(err, ErrNotFound) {
            http.Error(w, "User not found", http.StatusNotFound)
            return
        }
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}
```

### Middleware Pattern

```go
// Auth middleware
func AuthMiddleware(secret string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            token := r.Header.Get("Authorization")
            if token == "" {
                http.Error(w, "Unauthorized", http.StatusUnauthorized)
                return
            }

            userID, err := validateToken(token, secret)
            if err != nil {
                http.Error(w, "Invalid token", http.StatusUnauthorized)
                return
            }

            // Add user ID to context
            ctx := context.WithValue(r.Context(), userIDKey, userID)
            next.ServeHTTP(w, r.WithContext(ctx))
        })
    }
}

// Logging middleware
func LoggingMiddleware(logger *zap.Logger) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            start := time.Now()
            
            // Wrap response writer to capture status
            ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
            
            next.ServeHTTP(ww, r)
            
            logger.Info("request",
                zap.String("method", r.Method),
                zap.String("path", r.URL.Path),
                zap.Int("status", ww.Status()),
                zap.Duration("duration", time.Since(start)),
            )
        })
    }
}
```

---

## Database Patterns

### SQL Repository

```go
package repository

import (
    "context"
    "database/sql"
    "fmt"
    "time"

    "github.com/jackc/pgx/v5"
    "github.com/myorg/myproject/internal/domain"
)

type UserRepository struct {
    db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{db: db}
}

func (r *UserRepository) Get(ctx context.Context, id string) (*domain.User, error) {
    query := `
        SELECT id, email, name, created_at, is_active
        FROM users
        WHERE id = $1
    `
    
    var user domain.User
    err := r.db.QueryRowContext(ctx, query, id).Scan(
        &user.ID,
        &user.Email,
        &user.Name,
        &user.CreatedAt,
        &user.IsActive,
    )
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, domain.ErrUserNotFound
        }
        return nil, fmt.Errorf("querying user: %w", err)
    }
    
    return &user, nil
}

func (r *UserRepository) Create(ctx context.Context, u *domain.User) error {
    query := `
        INSERT INTO users (id, email, name, created_at, is_active)
        VALUES ($1, $2, $3, $4, $5)
    `
    
    u.ID = generateID()
    u.CreatedAt = time.Now()
    
    _, err := r.db.ExecContext(ctx, query,
        u.ID,
        u.Email,
        u.Name,
        u.CreatedAt,
        u.IsActive,
    )
    if err != nil {
        return fmt.Errorf("inserting user: %w", err)
    }
    
    return nil
}
```

### Transaction Pattern

```go
func (r *UserRepository) TransferBalance(
    ctx context.Context,
    fromID, toID string,
    amount decimal.Decimal,
) error {
    tx, err := r.db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
    if err != nil {
        return fmt.Errorf("beginning transaction: %w", err)
    }
    defer tx.Rollback()

    // Check balance
    var fromBalance decimal.Decimal
    err = tx.QueryRowContext(ctx,
        "SELECT balance FROM users WHERE id = $1 FOR UPDATE",
        fromID,
    ).Scan(&fromBalance)
    if err != nil {
        return fmt.Errorf("fetching from balance: %w", err)
    }

    if fromBalance.LessThan(amount) {
        return ErrInsufficientBalance
    }

    // Deduct from sender
    _, err = tx.ExecContext(ctx,
        "UPDATE users SET balance = balance - $1 WHERE id = $2",
        amount, fromID,
    )
    if err != nil {
        return fmt.Errorf("deducting from sender: %w", err)
    }

    // Add to receiver
    _, err = tx.ExecContext(ctx,
        "UPDATE users SET balance = balance + $1 WHERE id = $2",
        amount, toID,
    )
    if err != nil {
        return fmt.Errorf("adding to receiver: %w", err)
    }

    if err := tx.Commit(); err != nil {
        return fmt.Errorf("committing transaction: %w", err)
    }

    return nil
}
```

---

## Testing

### Unit Test Example

```go
package service

import (
    "context"
    "testing"
    "time"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
)

// Mock repository
type MockUserRepository struct {
    mock.Mock
}

func (m *MockUserRepository) Get(ctx context.Context, id string) (*User, error) {
    args := m.Called(ctx, id)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*User), args.Error(1)
}

func TestUserService_Get(t *testing.T) {
    // Arrange
    mockRepo := new(MockUserRepository)
    service := NewUserService(mockRepo)

    expectedUser := &User{
        ID:    "user-123",
        Email: "test@example.com",
    }

    mockRepo.On("Get", mock.Anything, "user-123").Return(expectedUser, nil)

    // Act
    ctx := context.Background()
    user, err := service.Get(ctx, "user-123")

    // Assert
    assert.NoError(t, err)
    assert.Equal(t, expectedUser, user)
    mockRepo.AssertExpectations(t)
}

func TestUserService_Get_NotFound(t *testing.T) {
    // Arrange
    mockRepo := new(MockUserRepository)
    service := NewUserService(mockRepo)

    mockRepo.On("Get", mock.Anything, "not-found").Return(nil, ErrUserNotFound)

    // Act
    ctx := context.Background()
    user, err := service.Get(ctx, "not-found")

    // Assert
    assert.ErrorIs(t, err, ErrUserNotFound)
    assert.Nil(t, user)
}
```

### Integration Test

```go
package repository

import (
    "context"
    "testing"

    "github.com/jackc/pgx/v5/pgxpool"
    "github.com/stretchr/testify/suite"
    "github.com/testcontainers/testcontainers-go"
    "github.com/testcontainers/testcontainers-go/wait"
)

type UserRepositorySuite struct {
    suite.Suite
    db *pgxpool.Pool
    repo *UserRepository
}

func (s *UserRepositorySuite) SetupSuite() {
    ctx := context.Background()

    // Start PostgreSQL container
    req := testcontainers.ContainerRequest{
        Image:        "postgres:15-alpine",
        ExposedPorts: []string{"5432/tcp"},
        Env: map[string]string{
            "POSTGRES_USER":     "test",
            "POSTGRES_PASSWORD": "test",
            "POSTGRES_DB":       "testdb",
        },
        WaitingFor: wait.ForListeningPort("5432/tcp"),
    }

    postgres, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
        ContainerRequest: req,
        Started:          true,
    })
    s.Require().NoError(err)

    // Connect and run migrations
    connStr := "postgres://test:test@localhost:5432/testdb"
    s.db, err = pgxpool.New(ctx, connStr)
    s.Require().NoError(err)

    // Run migrations
    // ...

    s.repo = NewUserRepository(s.db)
}

func (s *UserRepositorySuite) TestCreateAndGet() {
    ctx := context.Background()

    user := &domain.User{
        Email: "test@example.com",
        Name:  "Test User",
    }

    // Create
    err := s.repo.Create(ctx, user)
    s.NoError(err)
    s.NotEmpty(user.ID)

    // Get
    fetched, err := s.repo.Get(ctx, user.ID)
    s.NoError(err)
    s.Equal(user.Email, fetched.Email)
}

func TestUserRepositorySuite(t *testing.T) {
    suite.Run(t, new(UserRepositorySuite))
}
```

---

## Logging

### Structured Logging with Zap

```go
package main

import (
    "go.uber.org/zap"
    "go.uber.org/zap/zapcore"
)

func NewLogger() (*zap.Logger, error) {
    config := zap.Config{
        Level:       zap.NewAtomicLevelAt(zap.InfoLevel),
        Development: false,
        Encoding:    "json",
        EncoderConfig: zapcore.EncoderConfig{
            TimeKey:        "timestamp",
            LevelKey:       "level",
            NameKey:        "logger",
            CallerKey:      "caller",
            FunctionKey:    zapcore.OmitKey,
            MessageKey:     "msg",
            StacktraceKey:  "stacktrace",
            LineEnding:     zapcore.DefaultLineEnding,
            EncodeLevel:    zapcore.LowercaseLevelEncoder,
            EncodeTime:     zapcore.ISO8601TimeEncoder,
            EncodeDuration: zapcore.SecondsDurationEncoder,
            EncodeCaller:   zapcore.ShortCallerEncoder,
        },
        OutputPaths:      []string{"stdout"},
        ErrorOutputPaths: []string{"stderr"},
    }

    return config.Build()
}

// Usage
func processOrder(ctx context.Context, logger *zap.Logger, orderID string) error {
    logger.Info("processing_order",
        zap.String("order_id", orderID),
        zap.String("request_id", getRequestID(ctx)),
    )

    // Process...

    logger.Info("order_processed",
        zap.String("order_id", orderID),
        zap.Duration("duration", time.Since(start)),
    )

    return nil
}
```

---

## Verification Checklist

For Go projects:

- [ ] All errors checked
- [ ] Context passed to all async operations
- [ ] Defer used for resource cleanup
- [ ] Interfaces are small and focused
- [ ] Structs use appropriate tags
- [ ] No naked returns
- [ ] Tests cover success, error, and edge cases
- [ ] go fmt applied
- [ ] go vet passing
- [ ] golint/golangci-lint passing
- [ ] go mod tidy run
- [ ] Race detector tested (`go test -race`)

---

## See Also

- [stacks/go.md](../../stacks/go.md)
- [Getting Started](../getting-started.md)
- [Effective Go](https://go.dev/doc/effective_go)
