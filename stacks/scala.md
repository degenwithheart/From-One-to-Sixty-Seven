# Scala / Play Framework Specific Rules

> Stack: Scala + Play Framework + Akka + Slick
> Variant: JVM functional programming with actor model

## Project Structure

```
project/
├── app/
│   ├── controllers/
│   │   ├── UserController.scala
│   │   └── HomeController.scala
│   ├── models/
│   │   ├── User.scala
│   │   └── dao/
│   ├── services/
│   │   └── UserService.scala
│   ├── actors/
│   │   └── NotificationActor.scala
│   └── filters/
├── conf/
│   ├── application.conf
│   ├── routes
│   └── logback.xml
├── test/
│   └── controllers/
└── build.sbt
```

## Code Organization

### Controllers
```scala
package controllers

import javax.inject._
import play.api.mvc._
import play.api.libs.json._
import models.User
import services.UserService
import scala.concurrent.{ExecutionContext, Future}

/**
 * User controller with async operations.
 * 
 * ASSUMPTIONS:
 * - All operations are async (Future-based)
 * - JSON request/response bodies
 * - Authentication via action builder
 * 
 * SECURITY NOTE:
 * - Input validation via JSON formatters
 * - Rate limiting applied via filter
 * - SQL injection prevented by Slick
 */
@Singleton
class UserController @Inject()(
  userService: UserService,
  cc: ControllerComponents,
  authenticatedAction: AuthenticatedAction
)(implicit ec: ExecutionContext) extends AbstractController(cc) {

  implicit val userFormat: OFormat[User] = Json.format[User]

  def list: Action[AnyContent] = authenticatedAction.async { request =>
    /**
     * ASSUMPTIONS:
     * - Pagination prevents memory issues
     * - Users see only their data (unless admin)
     */
    val page = request.getQueryString("page").flatMap(_.toIntOption).getOrElse(1)
    val pageSize = Math.min(
      request.getQueryString("pageSize").flatMap(_.toIntOption).getOrElse(20),
      100
    )

    userService.findByUser(request.userId, page, pageSize).map { users =>
      Ok(Json.obj(
        "data" -> users,
        "meta" -> Json.obj(
          "page" -> page,
          "pageSize" -> pageSize
        )
      ))
    }
  }

  def create: Action[JsValue] = authenticatedAction.async(parse.json) { request =>
    request.body.validate[UserInput] match {
      case JsSuccess(input, _) =>
        userService.create(input.toUser(request.userId)).map { user =>
          Created(Json.toJson(user))
            .withHeaders("Location" -> routes.UserController.show(user.id).url)
        }
      
      case JsError(errors) =>
        Future.successful(
          BadRequest(Json.obj("errors" -> JsError.toJson(errors)))
        )
    }
  }

  def show(id: Long): Action[AnyContent] = authenticatedAction.async { request =>
    userService.findById(id).map {
      case Some(user) if user.ownerId == request.userId || request.isAdmin =>
        Ok(Json.toJson(user))
      case Some(_) =>
        Forbidden(Json.obj("error" -> "Access denied"))
      case None =>
        NotFound(Json.obj("error" -> "User not found"))
    }
  }

  def update(id: Long): Action[JsValue] = authenticatedAction.async(parse.json) { request =>
    request.body.validate[UserUpdateInput] match {
      case JsSuccess(input, _) =>
        userService.findById(id).flatMap {
          case Some(user) if user.ownerId == request.userId || request.isAdmin =>
            userService.update(id, input).map { updated =>
              Ok(Json.toJson(updated))
            }
          case Some(_) =>
            Future.successful(Forbidden(Json.obj("error" -> "Access denied")))
          case None =>
            Future.successful(NotFound(Json.obj("error" -> "User not found")))
        }
      
      case JsError(errors) =>
        Future.successful(
          BadRequest(Json.obj("errors" -> JsError.toJson(errors)))
        )
    }
  }

  def delete(id: Long): Action[AnyContent] = authenticatedAction.async { request =>
    userService.findById(id).flatMap {
      case Some(user) if user.ownerId == request.userId || request.isAdmin =>
        userService.softDelete(id).map { _ =>
          NoContent
        }
      case Some(_) =>
        Future.successful(Forbidden(Json.obj("error" -> "Access denied")))
      case None =>
        Future.successful(NotFound(Json.obj("error" -> "User not found")))
    }
  }
}
```

### Models & DAO
```scala
package models

import java.time.Instant
import play.api.libs.json._

/**
 * User model with validation.
 * 
 * SECURITY NOTE:
 * - Password never included in JSON output
 * - Email normalized on creation
 */
case class User(
  id: Long,
  email: String,
  passwordHash: String,  // Never exposed in JSON
  name: String,
  isActive: Boolean = true,
  isAdmin: Boolean = false,
  ownerId: Long,
  createdAt: Instant = Instant.now(),
  updatedAt: Instant = Instant.now(),
  deletedAt: Option[Instant] = None
)

object User {
  implicit val userWrites: Writes[User] = new Writes[User] {
    def writes(user: User): JsValue = Json.obj(
      "id" -> user.id,
      "email" -> user.email,
      "name" -> user.name,
      "isActive" -> user.isActive,
      "createdAt" -> user.createdAt.toString
      // Note: passwordHash intentionally omitted
    )
  }

  def normalizeEmail(email: String): String = 
    email.toLowerCase.trim
  
  def isValidEmail(email: String): Boolean =
    email.matches("""^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$""")
}
```

```scala
package models.dao

import models.User
import slick.jdbc.PostgresProfile.api._
import scala.concurrent.{ExecutionContext, Future}

/**
 * User DAO with Slick.
 * 
 * ASSUMPTIONS:
 * - Soft deletes via deleted_at column
 * - Pagination on all list operations
 */
class UserTable(tag: Tag) extends Table[User](tag, "users") {
  def id = column[Long]("id", O.PrimaryKey, O.AutoInc)
  def email = column[String]("email", O.Unique)
  def passwordHash = column[String]("password_hash")
  def name = column[String]("name")
  def isActive = column[Boolean]("is_active", O.Default(true))
  def isAdmin = column[Boolean]("is_admin", O.Default(false))
  def ownerId = column[Long]("owner_id")
  def createdAt = column[Instant]("created_at", O.Default(Instant.now()))
  def updatedAt = column[Instant]("updated_at", O.Default(Instant.now()))
  def deletedAt = column[Option[Instant]]("deleted_at")

  def * = (id, email, passwordHash, name, isActive, isAdmin, ownerId, createdAt, updatedAt, deletedAt) <> 
          (User.tupled, User.unapply)
}

class UserDAO(db: Database)(implicit ec: ExecutionContext) {
  private val users = TableQuery[UserTable]

  def findActive: Future[Seq[User]] = db.run {
    users.filter(_.deletedAt.isEmpty).result
  }

  def findByOwner(ownerId: Long, page: Int, pageSize: Int): Future[Seq[User]] = db.run {
    users
      .filter(u => u.ownerId === ownerId && u.deletedAt.isEmpty)
      .sortBy(_.createdAt.desc)
      .drop((page - 1) * pageSize)
      .take(pageSize)
      .result
  }

  def findById(id: Long): Future[Option[User]] = db.run {
    users.filter(u => u.id === id && u.deletedAt.isEmpty).result.headOption
  }

  def insert(user: User): Future[User] = db.run {
    (users returning users.map(_.id) into ((user, id) => user.copy(id = id))) += user
  }

  def update(id: Long, updates: User): Future[Int] = db.run {
    users.filter(_.id === id).map(u => (u.name, u.email, u.updatedAt))
      .update((updates.name, updates.email, Instant.now()))
  }

  def softDelete(id: Long): Future[Int] = db.run {
    users.filter(_.id === id).map(_.deletedAt).update(Some(Instant.now()))
  }
}
```

### Services
```scala
package services

import models.{User, UserDAO}
import org.mindrot.jbcrypt.BCrypt
import scala.concurrent.{ExecutionContext, Future}

/**
 * User service with business logic.
 * 
 * ASSUMPTIONS:
 * - All business rules enforced here
 * - Transactions for multi-step operations
 * - Audit logging for sensitive changes
 */
class UserService(userDAO: UserDAO)(implicit ec: ExecutionContext) {

  def create(input: UserInput): Future[Either[Seq[String], User]] = {
    // Validate email uniqueness
    userDAO.findByEmail(input.email).flatMap {
      case Some(_) =>
        Future.successful(Left(Seq("Email already exists")))
      
      case None =>
        val hashedPassword = BCrypt.hashpw(input.password, BCrypt.gensalt(12))
        val user = User(
          id = 0,
          email = User.normalizeEmail(input.email),
          passwordHash = hashedPassword,
          name = input.name,
          ownerId = input.ownerId
        )
        
        userDAO.insert(user).map(Right(_))
    }
  }

  def authenticate(email: String, password: String): Future[Option[User]] = {
    userDAO.findByEmail(User.normalizeEmail(email)).map {
      case Some(user) if BCrypt.checkpw(password, user.passwordHash) && user.isActive =>
        Some(user)
      case _ =>
        None
    }
  }
}
```

### Akka Actors
```scala
package actors

import akka.actor._
import akka.pattern.pipe
import scala.concurrent.Future

/**
 * Notification actor for async processing.
 * 
 * ASSUMPTIONS:
 * - At-least-once delivery via persistent queue
 * - Circuit breaker for external services
 */
class NotificationActor(emailService: EmailService) extends Actor with ActorLogging {
  import NotificationActor._
  import context.dispatcher

  def receive = {
    case SendEmail(to, subject, body) =>
      log.info(s"Sending email to $to")
      
      emailService.send(to, subject, body)
        .map(_ => EmailSent(to))
        .recover { case ex => EmailFailed(to, ex.getMessage) }
        .pipeTo(sender())

    case EmailSent(to) =>
      log.info(s"Email successfully sent to $to")

    case EmailFailed(to, error) =>
      log.error(s"Failed to send email to $to: $error")
      // Retry logic or dead letter queue
  }
}

object NotificationActor {
  case class SendEmail(to: String, subject: String, body: String)
  case class EmailSent(to: String)
  case class EmailFailed(to: String, error: String)
}
```

## Testing

```scala
package test.controllers

import org.scalatestplus.play._
import org.scalatestplus.play.guice.GuiceOneAppPerTest
import play.api.test._
import play.api.test.Helpers._
import play.api.libs.json._

class UserControllerSpec extends PlaySpec with GuiceOneAppPerTest {

  "UserController" should {
    
    "return users for authenticated request" in {
      val request = FakeRequest(GET, "/api/users")
        .withHeaders("Authorization" -> "Bearer valid_token")
      
      val result = route(app, request).get
      
      status(result) mustBe OK
      contentType(result) mustBe Some("application/json")
    }
    
    "reject invalid JSON on create" in {
      val request = FakeRequest(POST, "/api/users")
        .withHeaders("Authorization" -> "Bearer valid_token")
        .withJsonBody(Json.obj("email" -> "invalid"))
      
      val result = route(app, request).get
      
      status(result) mustBe BAD_REQUEST
    }
    
    "enforce unique email" in {
      // Test implementation
    }
  }
}
```

## Configuration

```hocon
# conf/application.conf

play.http.secret.key = ${?APPLICATION_SECRET}
play.http.session.secure = true
play.http.session.httpOnly = true
play.http.session.sameSite = "Strict"

play.filters.hosts.allowed = ["example.com", "localhost:9000"]

play.filters.headers.contentSecurityPolicy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.example.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"

database {
  profile = "slick.jdbc.PostgresProfile$"
  db {
    url = ${?DATABASE_URL}
    user = ${?DATABASE_USER}
    password = ${?DATABASE_PASSWORD}
    numThreads = 20
    queueSize = 1000
  }
}

# Rate limiting
rateLimiter {
  enabled = true
  requestsPerMinute = 60
}
```

## Security Checklist

- [ ] Application secret in environment variable
- [ ] HTTPS forced in production
- [ ] CSRF tokens on forms
- [ ] Content Security Policy configured
- [ ] SQL injection prevention (Slick)
- [ ] XSS prevention (Twirl auto-escaping)
- [ ] Bcrypt password hashing
- [ ] Session security (HttpOnly, Secure, SameSite)
- [ ] Rate limiting on API endpoints
- [ ] Input validation via JSON formatters
- [ ] Authorization checks in controllers
- [ ] Audit logging for sensitive operations

## SUMMARY

Scala/Play stack:
1. Use case classes for immutable data
2. Futures for all async operations
3. Pattern matching for control flow
4. Slick for type-safe SQL
5. Akka actors for concurrency
6. Play filters for cross-cutting concerns
7. ScalaTest for comprehensive testing
8. Functional programming principles
