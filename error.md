# CraftCV — Bug Report & Fixes

---

## SECTION A — Frontend Bugs (Blank White Page)

React crashes the entire page if **any** component throws an error during render. All bugs below caused silent crashes — no HTML, no error message, just a white screen.

---

### Bug 1 — Missing `useState` import in TemplateGallery

**File:** `frontend/src/components/templates/TemplateGallery.jsx` — line 109

```js
// BROKEN
const [filter, setFilter] = useState('all')  // useState is used but never imported
```

**Fix:**
```js
import { useState } from 'react'
```

**Why this fix works:**
In React, `useState` is NOT a global — it must be explicitly imported from the `react` package. Without the import, `useState` is `undefined` in the module scope. When the component tries to call `useState('all')`, JavaScript throws `TypeError: useState is not a function`. React's error boundary catches this and tears down the entire component tree, leaving a blank page. Adding the import makes `useState` available so React can create the filter state properly.

---

### Bug 2 — Missing `QueryClientProvider` in App.jsx

**File:** `frontend/src/App.jsx`

`CVScanner.jsx` uses `useMutation` from `@tanstack/react-query`:
```js
const scanMutation = useMutation({ ... })
```

**Error thrown:**
```
Error: No QueryClient set, use QueryClientProvider to set one
```

**Fix:**
```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

**Why this fix works:**
React Query uses React Context internally to share a single `QueryClient` instance across the entire component tree. `useMutation` (and `useQuery`) call `useContext(QueryClientContext)` under the hood. If no `QueryClientProvider` wraps the tree, the context returns `undefined`, and React Query throws immediately. Wrapping the app in `QueryClientProvider` creates the context value, so every component in the tree can access the shared client without it being passed as props.

---

### Bug 3 — Missing `GoogleOAuthProvider` in App.jsx

**File:** `frontend/src/App.jsx`

`LoginPage.jsx` uses `<GoogleLogin />` from `@react-oauth/google`:
```jsx
<GoogleLogin onSuccess={handleGoogleSuccess} />
```

**Error thrown:**
```
Error: GoogleOAuthProvider is required to use GoogleLogin
```

**Fix:**
```jsx
import { GoogleOAuthProvider } from '@react-oauth/google'

<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
  <App />
</GoogleOAuthProvider>
```

**Why this fix works:**
Same pattern as React Query — `@react-oauth/google` uses React Context to share the Google OAuth configuration (client ID, token state) across all components. `GoogleLogin` reads `clientId` from that context. Without `GoogleOAuthProvider`, the context is empty and the component crashes. The `|| ''` fallback means the app won't crash even if `VITE_GOOGLE_CLIENT_ID` is not set — the Google button will just show a config error instead of crashing the whole page.

> **Note:** To enable Google login, add `VITE_GOOGLE_CLIENT_ID=your-client-id` to `frontend/.env`.

---

### Bug 4 — Missing `index.html` (Vite entry point)

**File:** `frontend/index.html` — did not exist

**Why this fix works:**
Vite is fundamentally different from Create React App. It does NOT look for `src/index.js` as the entry point — it looks for `index.html` at the project root. This HTML file contains the `<div id="root">` that React mounts into, and the `<script type="module" src="/src/main.jsx">` that boots the app. Without `index.html`, Vite has no entry point and serves a blank response to every request.

---

### Bug 5 — Missing `main.jsx` (React root mount)

**File:** `frontend/src/main.jsx` — did not exist

**Why this fix works:**
React 18 requires `ReactDOM.createRoot()` to mount the app. This call finds the `<div id="root">` in `index.html` and hands control of it to React. Without `main.jsx`, no React code ever executes — the browser loads the HTML shell but the `<script>` tag pointing to `main.jsx` throws a module-not-found error, leaving the `#root` div empty.

---

### Bug 6 — `App.jsx` was empty (0 bytes)

**File:** `frontend/src/App.jsx`

**Why this fix works:**
`main.jsx` imports `App` from `./App.jsx` and renders it as the root component. An empty file exports nothing, so `App` is `undefined`. Calling `ReactDOM.createRoot(...).render(<App />)` with `App = undefined` throws immediately. Writing the full router setup with routes and providers gave React something to render.

---

### Bug 7 — Missing config files

| File | What broke without it | Why the fix works |
|------|----------------------|-------------------|
| `vite.config.js` | No dev server config, no API proxy | Tells Vite to forward `/api/*` requests to `localhost:8000` so CORS is avoided |
| `tailwind.config.js` | All Tailwind classes silently ignored | Tells Tailwind which files to scan so it generates only the CSS classes actually used |
| `postcss.config.js` | Tailwind not processed at all | PostCSS is the transformer that runs Tailwind — without this config, the `@tailwind` directives in CSS are treated as unknown at-rules and stripped |
| `src/index.css` | No base styles, no utility classes | The `@tailwind base/components/utilities` directives inject Tailwind's generated CSS into the bundle |

---

### Bug 8 — Missing `lib/api.js` and `store/authStore.js`

Both files were imported but didn't exist:

| File | Imported by | What it does |
|------|------------|-------------|
| `frontend/src/lib/api.js` | `LoginPage.jsx`, `CVScanner.jsx` | Axios instance pre-configured with `baseURL`, JWT header injection, and auto-refresh on 401 |
| `frontend/src/store/authStore.js` | `LoginPage.jsx`, `App.jsx` | Zustand store that holds `user`, `isAuthenticated`, `login()`, `logout()` — persisted to localStorage |

**Why the fix works:**
JavaScript ES module imports are resolved at parse time, before any code runs. A missing file causes a module resolution error that prevents the entire module graph from loading. Creating these files with the correct exports makes the import chain complete.

---

## SECTION B — Backend Bug (Authentication 404)

### Bug 9 — No API endpoints registered

**Files:**
- `backend/CraftCv/user/views.py` — was completely empty
- `backend/CraftCv/user/urls.py` — did not exist
- `backend/CraftCv/CraftCv/urls.py` — only had `/admin/`

**Symptom:** Every login/register request returned HTTP 404. The frontend showed `"API endpoint not found (404)"`.

**Fix — views.py:**
Implemented 5 views:
| View | Endpoint | What it does |
|------|----------|-------------|
| `RegisterView` | `POST /api/auth/register/` | Creates user, returns JWT pair |
| `LoginView` | `POST /api/auth/login/` | Validates email+password, returns JWT pair |
| `LogoutView` | `POST /api/auth/logout/` | Blacklists refresh token |
| `GoogleAuthView` | `POST /api/auth/google/` | Verifies Google ID token, creates/finds user |
| `MeView` | `GET /api/auth/me/` | Returns current user profile |

**Fix — urls.py:**
```python
# user/urls.py — new file
urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('google/', GoogleAuthView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('me/', MeView.as_view()),
]

# CraftCv/urls.py — updated
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('user.urls')),  # ← added
]
```

**Why this fix works:**
Django's URL dispatcher maps incoming HTTP paths to view functions by checking `urlpatterns` top-to-bottom. Without `include('user.urls')` in the root `urls.py`, Django never knows the auth routes exist and returns 404 for everything under `/api/auth/`. Adding the `include()` delegates all `/api/auth/*` requests to `user/urls.py`, which maps each path to the correct view class.

---

### Bug 10 — `google-auth` module not found on hot-reload

**Error:**
```
ModuleNotFoundError: No module named 'google'
```

**Why it happened:**
The Django server was started BEFORE `google-auth` was installed. Django's StatReloader watches `.py` files for changes. When `urls.py` was edited, it reloaded — but at the exact moment of reload, `google-auth` was still being installed in a parallel background task. The reload tried to import `views.py` which imports `from google.oauth2 import id_token` — package not yet available — crash.

**Why the fix works:**
Stopping the server completely and restarting it fresh (AFTER `google-auth` was fully installed) allowed Python to find the package in `venv/Lib/site-packages` on the very first import. Hot-reload inherits the already-loaded module cache from the parent process, so it can miss packages installed after startup. A clean restart always does a full fresh import.

---

### Bug 11 — Improved error messages in LoginPage

**Before:** All failures showed `"Authentication failed"` — no detail.

**After:** Errors are categorised:

| Scenario | Message shown |
|----------|--------------|
| Backend not running | `"Cannot reach server"` + `"Start it with: python manage.py runserver"` |
| Wrong endpoint (404) | `"API endpoint not found (404)"` + the URL that failed |
| Wrong password | `"Incorrect password."` |
| No account for email | `"No account found with this email."` |
| Validation error | Exact message from the server |
| Unknown error | HTTP status code + raw server response |

**Why this fix works:**
Axios wraps HTTP responses in an `error` object with `error.response.status` (HTTP code) and `error.response.data` (body). By checking `!err.response` first (network failure = no response at all), then branching on status codes (404, 401, 400, etc.), we can show the user exactly what failed instead of a generic message. The server's `detail` field in JSON responses carries the human-readable reason.

---

## Import Verification

All imports in `user/views.py` tested and confirmed working:

```
OK: django.contrib.auth.get_user_model
OK: rest_framework (status, APIView, Response, AllowAny, IsAuthenticated)
OK: rest_framework_simplejwt (RefreshToken, TokenError)
OK: google.oauth2.id_token + google.auth.transport.requests
OK: django.conf.settings
```

No missing modules in `user/views.py`.

---

---

## SECTION C — CORS / Network Bug

### Bug 12 — Frontend cannot reach backend ("Cannot reach server")

**Symptom:** Login shows `"Cannot reach server — The backend is not running"` even though Django is running fine.

**Root cause — two separate problems working together:**

#### Problem A: Hardcoded absolute URL in `api.js`
```js
// BROKEN
baseURL: 'http://localhost:8000/api'
```
`vite.config.js` has a proxy rule: any request to `/api/*` gets forwarded to `http://localhost:8000`. But because `api.js` used an **absolute URL** (`http://localhost:8000/...`), the request goes directly from browser to Django — bypassing the Vite proxy entirely. This means CORS headers must be correct, or the browser blocks the response.

**Fix:**
```js
// FIXED — relative URL, Vite proxy handles it
baseURL: '/api'
```
With a relative URL, the browser sends the request to `http://localhost:5174/api/...` (same origin as the frontend). Vite intercepts it, strips `/api`, and forwards to `http://localhost:8000/api/...`. The browser never sees a cross-origin request so CORS is irrelevant.

#### Problem B: Vite port changed from 5173 → 5174
When port 5173 was already in use, Vite automatically switched to 5174. Django's `CORS_ALLOWED_ORIGINS` only listed `localhost:5173`, so every request from `localhost:5174` was blocked by the browser's CORS policy.

**Fix in settings.py:**
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",  # ← added
    "http://localhost:5175",  # ← added as fallback
    "https://craftcv.app",
]
CORS_ALLOW_CREDENTIALS = True
```

**Why the fix works:**
Using a relative `baseURL` (`/api`) means all API calls go through Vite's dev proxy, which forwards them to Django server-side. The browser only ever talks to `localhost:517x` (same origin), so CORS never triggers. The proxy approach is the standard pattern for Vite + Django/FastAPI development — it avoids needing to configure CORS at all during development. The `CORS_ALLOWED_ORIGINS` fix is a secondary safety net for when absolute URLs are used or in production.

Also fixed the token refresh call which had the same absolute URL problem:
```js
// BROKEN
axios.post('http://localhost:8000/api/auth/token/refresh/', ...)

// FIXED
axios.post('/api/auth/token/refresh/', ...)
```

---

## Full Summary

| # | Location | Bug | Fix | Status |
|---|----------|-----|-----|--------|
| 1 | TemplateGallery.jsx | `useState` not imported | Added import | ✅ |
| 2 | App.jsx | `QueryClientProvider` missing | Wrapped app | ✅ |
| 3 | App.jsx | `GoogleOAuthProvider` missing | Wrapped app | ✅ |
| 4 | frontend/ | `index.html` missing | Created | ✅ |
| 5 | frontend/src/ | `main.jsx` missing | Created | ✅ |
| 6 | frontend/src/ | `App.jsx` empty | Implemented | ✅ |
| 7 | frontend/ | All config files missing | Created | ✅ |
| 8 | frontend/src/ | `api.js` + `authStore.js` missing | Created | ✅ |
| 9 | backend/ | No API endpoints at all | Built auth API | ✅ |
| 10 | backend/ | `google-auth` not found on hot-reload | Restarted server | ✅ |
| 11 | LoginPage.jsx | Vague error messages | Detailed error display | ✅ |
