# Authentication — Azure AD MSAL Integration

All steps below are mandatory. `UserRole` values used in MSAL config and JWT claims match the `users.role` ENUM in the data model.

---

## Step 1: Install MSAL Packages

```bash
npm install @azure/msal-browser @azure/msal-react
```

---

## Step 2: Create Authentication Config (`src/authConfig.ts`)

Single file containing all MSAL configuration. Exported constants consumed by `main.tsx` and `src/api/axiosInstance.ts`.

```typescript
import type { Configuration, PopupRequest } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_AD_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_AD_TENANT_ID}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI, // e.g. http://localhost:5173
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

// Scope targets the backend App Registration's exposed API permission
export const loginRequest: PopupRequest = {
  scopes: [`api://${import.meta.env.VITE_BACKEND_CLIENT_ID}/access_as_user`],
};
```

**Token storage rule:** Token is stored in memory only — never in `localStorage`. MSAL handles its own token cache via `sessionStorage` internally. The backend-issued access token is kept in React state/context only.

---

## Step 3: Wrap App with MSAL Provider (`src/main.tsx`)

```typescript
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "@/authConfig";

const msalInstance = new PublicClientApplication(msalConfig);

// Initialize before rendering (required for redirect flows)
await msalInstance.initialize();

root.render(
  <MsalProvider instance={msalInstance}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </MsalProvider>
);
```

---

## Step 4: Login Button (`src/pages/Login/LoginPage.tsx`)

```typescript
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/authConfig";

function LoginPage() {
  const { instance } = useMsal();

  const handleLogin = async () => {
    try {
      await instance.loginPopup(loginRequest);
      // After successful MSAL login, AuthContext calls GET /api/auth/me
      // to fetch backend user profile (id, role, name)
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-6">
        <img src="/olympus-logo.svg" alt="Olympus" className="h-16 mx-auto" />
        <h1 className="text-2xl font-semibold">EQC Asset Management</h1>
        <button onClick={handleLogin} className="btn-primary px-8 py-3 rounded-lg">
          Sign in with Olympus AD
        </button>
      </div>
    </div>
  );
}
```

Page behavior:
- If MSAL returns an active account on page load → auto-redirect to `/dashboard`
- Shows a spinner during the login popup flow

---

## Step 5: Acquire JWT Token and Send to Backend (`src/api/axiosInstance.ts`)

```typescript
import axios from "axios";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "@/authConfig";

const msalInstance = new PublicClientApplication(msalConfig);

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach Bearer token to every request
apiClient.interceptors.request.use(async (config) => {
  try {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) throw new Error("No active account");

    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    });

    config.headers.Authorization = `Bearer ${response.accessToken}`;
  } catch {
    // Token silent acquisition failed — trigger interactive login
    await msalInstance.acquireTokenPopup(loginRequest);
  }
  return config;
});

// Normalize error responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = error.response?.data?.error ?? {
      code: "NETWORK_ERROR",
      message: "A network error occurred",
    };
    return Promise.reject(apiError);
  }
);
```

---

## Step 6: Auth Flow on Application Load

When the app loads, `AuthContext` checks MSAL for an active account. If found, calls `GET /api/auth/me` with the silently acquired token to fetch the backend user record (including `role`). This role governs all RBAC decisions throughout the app. If no MSAL account is found, redirects to `/login`.

---

## AuthContext (`src/context/AuthContext.tsx`)

React context holding the authenticated `AuthUser` object.

- `AuthProvider` wraps the app inside `MsalProvider`
- On mount, calls `getMe()` if MSAL reports an active account
- Exposes `user`, `setUser`, `isLoading`
- Children consume via `useCurrentUser()` hook

**`AuthUser` interface** (defined in `src/types/auth.types.ts`):
```typescript
interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  sfdc_user_id?: string;
}
```

---

## ThemeContext (`src/context/ThemeContext.tsx`)

Light/dark mode context (optional, defaults to light). Reads from `localStorage`. Applies `dark` class to `<html>` element for Tailwind dark mode variant.

---

## Auth Hooks

**`src/hooks/useAuth.ts`**  
Wraps `useMsal()` and the `AuthUser` context. Returns `{ user, isLoading, isAuthenticated, login, logout }`.
- `login()` calls `instance.loginPopup(loginRequest)`
- `logout()` calls `instance.logoutPopup()`
- After successful login, calls `getMe()` to fetch backend user profile

**`src/hooks/useCurrentUser.ts`**  
Returns the `AuthUser` from context. Throws if called outside `AuthProvider`. Used throughout the app to access `user.role` for RBAC rendering.

**`src/hooks/useHasRole.ts`**  
`useHasRole(...roles: UserRole[]): boolean` — returns `true` if the current user's role is in the allowed list.

---

## Layouts

**`src/layouts/AuthenticatedLayout.tsx`**  
Shell layout for all authenticated pages. Renders `<Sidebar />`, `<TopNav />`, and `<main>` with `<Outlet />`. Fetches current user on mount via `useCurrentUser()`. Redirects to `/login` if not authenticated.

**`src/layouts/PublicLayout.tsx`**  
Minimal layout for unauthenticated pages (login, error pages). Renders only Olympus logo and content area.
