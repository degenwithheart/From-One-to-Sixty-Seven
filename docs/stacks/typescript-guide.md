# TypeScript Guide: Deep Dive

Comprehensive guide for using From One to Sixty-Seven with TypeScript and JavaScript projects.

---

## TypeScript-Specific Rules

### Strict Mode

**Required:** Enable strict mode in tsconfig.json.

**Compliant:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

**Benefits:**
- Catches null/undefined errors at compile time
- Prevents implicit any
- Enforces proper type annotations

### Type Annotations

**Required:** Explicit types on function signatures and complex objects.

**Compliant:**
```typescript
// Function with full type annotations
function calculateDiscount(
  orderTotal: number,
  customerTier: 'bronze' | 'silver' | 'gold'
): number {
  const discounts = {
    bronze: 0.05,
    silver: 0.10,
    gold: 0.15
  };
  return orderTotal * discounts[customerTier];
}

// Interface for complex object
interface User {
  id: string;
  email: string;
  name?: string;  // Optional
  createdAt: Date;
  isActive: boolean;
}

// Type for API response
type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };
```

**Violation:**
```typescript
// No type annotations
function calculateDiscount(orderTotal, customerTier) {
  // Implicit any!
}

// Implicit any
function processUser(user) {
  return user.email;  // Could be undefined
}
```

### Null and Undefined Handling

**Rule:** Explicitly handle null/undefined, never assume values exist.

**Compliant:**
```typescript
// Null-safe property access
function getUserEmail(user: User | null): string | null {
  return user?.email ?? null;
}

// Type guard
function processUser(user: User | null): void {
  if (!user) {
    console.warn("User is null");
    return;
  }
  
  // TypeScript knows user is not null here
  console.log(user.email);
}

// Non-null assertion (use sparingly, with justification)
function getEmailDomain(email: string | null): string {
  // We know email is set from validation above
  return email!.split('@')[1];
}
```

**Violation:**
```typescript
// No null check
function processUser(user: User | null): void {
  console.log(user.email);  // Runtime error if user is null
}
```

### Async/Await and Promises

**Compliant:**
```typescript
// Proper async function
async function fetchUser(userId: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return validateUser(data);  // Validate at boundary
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}

// Promise with proper typing
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Parallel execution with Promise.all
async function fetchUsers(userIds: string[]): Promise<User[]> {
  const users = await Promise.all(
    userIds.map(id => fetchUser(id))
  );
  return users.filter((user): user is User => user !== null);
}
```

**Violation:**
```typescript
// No error handling
async function fetchUser(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();  // Could fail, no type safety
}

// Unhandled promise rejection
fetchUser('123').then(user => console.log(user.email));
```

---

## React-Specific Patterns

### Component Types

**Compliant:**
```typescript
// Props interface
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

// Functional component
const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  disabled = false,
  variant = 'primary' 
}) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
};

// Alternative without React.FC (preferred)
function Button({ 
  label, 
  onClick, 
  disabled = false,
  variant = 'primary' 
}: ButtonProps): JSX.Element {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
}
```

### State Management

**Compliant:**
```typescript
// Typed state
interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const [state, setState] = useState<UserState>({
  user: null,
  isLoading: false,
  error: null
});

// Reducer with actions
type UserAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: User }
  | { type: 'FETCH_ERROR'; payload: string };

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, user: action.payload, isLoading: false };
    case 'FETCH_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}
```

### Custom Hooks

**Compliant:**
```typescript
// Hook with return type
interface UseFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

// Usage
const { data: user, isLoading, error } = useFetch<User>('/api/user');
```

---

## Node.js Patterns

### Error Handling

**Compliant:**
```typescript
// Express error handler
import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
}

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Async route handler wrapper
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage
app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await getUser(req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
}));
```

### API Route Types

```typescript
// Request/Response types
interface CreateUserRequest {
  email: string;
  password: string;
  name?: string;
}

interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

// Route with typed request
app.post('/users', async (req: Request<{}, {}, CreateUserRequest>, res) => {
  const { email, password, name } = req.body;
  
  // Validation
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }
  
  const user = await createUser({ email, password, name });
  const response: UserResponse = {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString()
  };
  
  res.status(201).json(response);
});
```

---

## Project Structure

### Recommended Layout

```
myproject/
├── src/
│   ├── components/          # React components
│   │   ├── Button.tsx
│   │   └── Form.tsx
│   ├── hooks/               # Custom React hooks
│   │   └── useAuth.ts
│   ├── pages/               # Page components (Next.js)
│   │   ├── index.tsx
│   │   └── dashboard.tsx
│   ├── lib/                 # Utility functions
│   │   └── api.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── services/            # Business logic
│   │   └── auth.ts
│   └── utils/               # Helper functions
│       └── validators.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── setup.ts
├── package.json
├── tsconfig.json
├── jest.config.js
└── .eslintrc.js
```

### Configuration Files

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@lib/*": ["src/lib/*"]
    }
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist", "build"]
}
```

**package.json (key sections):**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "jest": "^29.0.0",
    "prettier": "^3.0.0",
    "ts-jest": "^29.0.0"
  }
}
```

---

## Testing

### Jest Configuration

**jest.config.js:**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
};
```

### Test Examples

**Unit test:**
```typescript
// tests/unit/calculateDiscount.test.ts
import { calculateDiscount } from '@/utils/pricing';

describe('calculateDiscount', () => {
  it('should calculate bronze tier discount', () => {
    const result = calculateDiscount(100, 'bronze');
    expect(result).toBe(5);
  });

  it('should calculate gold tier discount', () => {
    const result = calculateDiscount(100, 'gold');
    expect(result).toBe(15);
  });

  it('should throw for invalid tier', () => {
    expect(() => calculateDiscount(100, 'invalid' as any))
      .toThrow('Invalid tier');
  });
});
```

**React component test:**
```typescript
// tests/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('should render with label', () => {
    render(<Button label="Click me" onClick={jest.fn()} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button label="Click me" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button label="Click me" onClick={jest.fn()} disabled />);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

**Integration test:**
```typescript
// tests/integration/api.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/users';

describe('/api/users', () => {
  it('should create user with valid data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toMatchObject({
      email: 'test@example.com'
    });
  });
});
```

---

## Linting and Formatting

### ESLint Configuration

**.eslintrc.js:**
```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'no-console': ['warn', { allow: ['error', 'warn'] }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

### Prettier Configuration

**.prettierrc:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

---

## Common Patterns

### Validation with Zod

```typescript
import { z } from 'zod';

// Schema definition
const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional()
});

// Infer type from schema
type UserInput = z.infer<typeof UserSchema>;

// Validate
function createUser(input: unknown): UserInput {
  return UserSchema.parse(input);  // Throws on invalid
}

// Safe parse (returns result object)
function validateUser(input: unknown): 
  | { success: true; data: UserInput }
  | { success: false; errors: z.ZodError } {
  const result = UserSchema.safeParse(input);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error };
}
```

### API Client with Fetch

```typescript
interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

// Usage
const api = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
});

const user = await api.get<User>('/users/123');
```

### State Management with Context

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await apiLogin(email, password);
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

## Verification Checklist

For TypeScript projects:

- [ ] Strict mode enabled in tsconfig.json
- [ ] No implicit any
- [ ] Type annotations on functions
- [ ] Null/undefined handled explicitly
- [ ] Async errors caught
- [ ] React props typed
- [ ] Custom hooks typed
- [ ] API responses validated
- [ ] Tests cover happy path, errors, edge cases
- [ ] ESLint passing
- [ ] Type checking passing (`tsc --noEmit`)
- [ ] No `any` types except where justified

---

## See Also

- [stacks/typescript.md](../../stacks/typescript.md)
- [Getting Started](../getting-started.md)
- [Examples](../examples.md)
