# Elixir / Phoenix Specific Rules

> Stack: Elixir + Phoenix + Ecto + PostgreSQL
> Variant: Functional programming, high-concurrency systems

## Project Structure

```
project/
├── config/
│   ├── config.exs
│   ├── dev.exs
│   ├── prod.exs
│   └── runtime.exs
├── lib/
│   ├── my_app/
│   │   ├── application.ex
│   │   ├── repo.ex
│   │   ├── schema.ex
│   │   ├── context.ex
│   │   └── web/
│   │       ├── router.ex
│   │       ├── controllers/
│   │       ├── live/
│   │       └── components/
│   └── my_app.ex
├── priv/
│   ├── repo/migrations/
│   └── static/
├── test/
│   ├── support/
│   └── my_app/
└── mix.exs
```

## Code Organization

### Contexts (Business Logic)
```elixir
defmodule MyApp.Accounts do
  @moduledoc """
  The Accounts context.
  
  ASSUMPTIONS:
  - User emails are unique across the system
  - Passwords are hashed with bcrypt (work factor 12)
  - Sessions are stored in ETS with TTL
  """
  
  import Ecto.Query, warn: false
  alias MyApp.Repo
  alias MyApp.Accounts.User
  
  @doc """
  Gets a single user.
  
  Returns nil if no user found.
  
  ## Examples
      iex> get_user!(123)
      %User{}
      
      iex> get_user!(456)
      nil
  """
  def get_user!(id), do: Repo.get!(User, id)
  
  def get_user(id), do: Repo.get(User, id)
  
  @doc """
  Creates a user.
  
  SECURITY NOTE:
  - Password is hashed before storage
  - Email is normalized (downcased, trimmed)
  """
  def create_user(attrs) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
  end
  
  @doc """
  Updates a user.
  
  ASSUMPTIONS:
  - Only whitelisted fields can be updated
  - Email changes require re-verification
  """
  def update_user(%User{} = user, attrs) do
    user
    |> User.changeset(attrs)
    |> Repo.update()
  end
  
  @doc """
  Soft deletes a user.
  
  ASSUMPTIONS:
  - User data retained for compliance
  - Associated data anonymized, not deleted
  """
  def delete_user(%User{} = user) do
    Repo.update_all(
      from(u in User, where: u.id == ^user.id),
      set: [deleted_at: DateTime.utc_now(), active: false]
    )
  end
end
```

### Schemas (Data Models)
```elixir
defmodule MyApp.Accounts.User do
  @moduledoc """
  User schema with validations and security.
  
  SECURITY NOTE:
  - Password stored as bcrypt hash only
  - Session tokens are cryptographically random
  - 2FA secret encrypted at rest
  """
  
  use Ecto.Schema
  import Ecto.Changeset
  
  schema "users" do
    field :email, :string
    field :password_hash, :string, redact: true
    field :password, :string, virtual: true, redact: true
    field :name, :string
    field :active, :boolean, default: true
    field :admin, :boolean, default: false
    field :email_verified, :boolean, default: false
    field :deleted_at, :utc_datetime
    
    has_many :sessions, MyApp.Accounts.Session
    has_many :posts, MyApp.Blog.Post
    
    timestamps(type: :utc_datetime)
  end
  
  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :password, :name])
    |> validate_required([:email, :password])
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must have the @ sign and no spaces")
    |> validate_length(:password, min: 8, max: 100)
    |> validate_password_strength()
    |> normalize_email()
    |> unique_constraint(:email)
    |> hash_password()
  end
  
  defp validate_password_strength(changeset) do
    validate_change(changeset, :password, fn _, password ->
      cond do
        not String.match?(password, ~r/[A-Z]/) -> [password: "must contain uppercase letter"]
        not String.match?(password, ~r/[a-z]/) -> [password: "must contain lowercase letter"]
        not String.match?(password, ~r/[0-9]/) -> [password: "must contain digit"]
        true -> []
      end
    end)
  end
  
  defp normalize_email(changeset) do
    update_change(changeset, :email, &String.downcase/1)
    |> update_change(:email, &String.trim/1)
  end
  
  defp hash_password(changeset) do
    case get_change(changeset, :password) do
      nil -> changeset
      password -> 
        change(changeset, 
          password_hash: Bcrypt.hash_pwd_salt(password),
          password: nil
        )
    end
  end
end
```

### Controllers
```elixir
defmodule MyAppWeb.UserController do
  @moduledoc """
  User controller with JSON API responses.
  
  ASSUMPTIONS:
  - Authentication enforced by pipeline
  - Rate limiting on all endpoints
  """
  
  use MyAppWeb, :controller
  
  alias MyApp.Accounts
  alias MyApp.Accounts.User
  
  action_fallback MyAppWeb.FallbackController
  
  plug :authorize_user when action in [:update, :delete]
  
  def index(conn, _params) do
    users = Accounts.list_users()
    render(conn, :index, users: users)
  end
  
  def create(conn, %{"user" => user_params}) do
    with {:ok, %User{} = user} <- Accounts.create_user(user_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/users/#{user}")
      |> render(:show, user: user)
    end
  end
  
  def show(conn, %{"id" => id}) do
    user = Accounts.get_user!(id)
    render(conn, :show, user: user)
  end
  
  def update(conn, %{"id" => id, "user" => user_params}) do
    user = Accounts.get_user!(id)
    
    with {:ok, %User{} = user} <- Accounts.update_user(user, user_params) do
      render(conn, :show, user: user)
    end
  end
  
  def delete(conn, %{"id" => id}) do
    user = Accounts.get_user!(id)
    
    with {:ok, %User{}} <- Accounts.delete_user(user) do
      send_resp(conn, :no_content, "")
    end
  end
  
  # Private functions
  
  defp authorize_user(conn, _opts) do
    user = conn.assigns.current_user
    requested_id = String.to_integer(conn.params["id"])
    
    if user.id == requested_id or user.admin do
      conn
    else
      conn
      |> put_status(:forbidden)
      |> put_view(MyAppWeb.ErrorView)
      |> render(:"403")
      |> halt()
    end
  end
end
```

### LiveView Components
```elixir
defmodule MyAppWeb.ProductLive.Index do
  @moduledoc """
  LiveView for product management.
  
  ASSUMPTIONS:
  - Real-time updates via PubSub
  - Optimistic UI for immediate feedback
  """
  
  use MyAppWeb, :live_view
  
  alias MyApp.Catalog
  alias MyApp.Catalog.Product
  
  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      MyAppWeb.Endpoint.subscribe("products")
    end
    
    {:ok, assign(socket, :products, list_products())}
  end
  
  @impl true
  def handle_event("delete", %{"id" => id}, socket) do
    product = Catalog.get_product!(id)
    {:ok, _} = Catalog.delete_product(product)
    
    # Optimistic UI update
    {:noreply, 
     update(socket, :products, fn products -> 
       Enum.reject(products, & &1.id == product.id)
     end)}
  end
  
  @impl true
  def handle_info(%{event: "product_created", payload: product}, socket) do
    {:noreply, 
     update(socket, :products, fn products -> [product | products] end)}
  end
  
  defp list_products do
    Catalog.list_products()
  end
end
```

## Testing

```elixir
defmodule MyApp.AccountsTest do
  use MyApp.DataCase
  
  alias MyApp.Accounts
  
  describe "users" do
    alias MyApp.Accounts.User
    
    @valid_attrs %{email: "test@example.com", password: "SecurePass123", name: "Test User"}
    @invalid_attrs %{email: nil, password: nil}
    
    test "get_user!/1 returns the user with given id" do
      user = user_fixture()
      assert Accounts.get_user!(user.id) == user
    end
    
    test "create_user/1 with valid data creates a user" do
      assert {:ok, %User{} = user} = Accounts.create_user(@valid_attrs)
      assert user.email == "test@example.com"
      assert Bcrypt.verify_pass("SecurePass123", user.password_hash)
    end
    
    test "create_user/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Accounts.create_user(@invalid_attrs)
    end
    
    test "create_user/1 enforces unique email" do
      user_fixture(email: "duplicate@example.com")
      
      assert {:error, changeset} = Accounts.create_user(
        %{@valid_attrs | email: "duplicate@example.com"}
      )
      assert "has already been taken" in errors_on(changeset).email
    end
    
    test "create_user/1 requires strong password" do
      assert {:error, changeset} = Accounts.create_user(
        %{@valid_attrs | password: "weak"}
      )
      assert "at least 8 character(s)" in errors_on(changeset).password
    end
  end
  
  defp user_fixture(attrs \\ %{}) do
    {:ok, user} = 
      attrs
      |> Enum.into(@valid_attrs)
      |> Accounts.create_user()
      
    user
  end
end
```

## Concurrency & Error Handling

```elixir
defmodule MyApp.Workers.EmailWorker do
  @moduledoc """
  Background job worker with retries.
  
  ASSUMPTIONS:
  - Max 3 retries with exponential backoff
  - Dead letter queue for failed jobs
  """
  
  use Oban.Worker, queue: :email, max_attempts: 3
  
  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"user_id" => user_id, "template" => template}}) do
    user = MyApp.Accounts.get_user!(user_id)
    
    case send_email(user, template) do
      {:ok, _} -> :ok
      {:error, reason} -> 
        require Logger
        Logger.error("Failed to send email to #{user.email}: #{inspect(reason)}")
        {:error, reason}
    end
  end
  
  defp send_email(user, template) do
    # Email sending logic
    {:ok, :sent}
  end
end
```

## Security Checklist

- [ ] Secrets in `config/runtime.exs` or env vars
- [ ] `force_ssl` in production
- [ ] CSRF protection enabled
- [ ] SQL injection prevention (Ecto parameterized queries)
- [ ] XSS prevention (Phoenix auto-escaping)
- [ ] Password hashing with bcrypt
- [ ] Rate limiting on auth endpoints
- [ ] Session security (HttpOnly, Secure, SameSite)
- [ ] Content Security Policy headers
- [ ] Input validation on all changesets
- [ ] Authorization with pattern matching
- [ ] Audit logging for sensitive operations

## SUMMARY

Elixir/Phoenix stack:
1. Organize by contexts (bounded domains)
2. Changesets for all data validation
3. Pattern matching for control flow
4. GenServers for stateful processes
5. PubSub for real-time features
6. Oban for background jobs
7. Comprehensive ExUnit tests
8. Security by default (bcrypt, CSRF, CSP)
