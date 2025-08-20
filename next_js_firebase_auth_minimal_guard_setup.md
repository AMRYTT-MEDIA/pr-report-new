# Next.js + Firebase Auth: Minimal Guard Setup

**Goals**
- No route arrays to maintain.
- **Frontend-only** auth (no Next API, no Firebase Admin, no server code).
- Public pages (no login), Protected pages (login required), Private pages (login + extra checks) — handled **client-side**.
- If token expires → redirect to `/login` (client-side listener).
- Header & Footer appear **after** login only.
- Small, easy, production-ready foundation for **Next.js 14**.
- Deployment guide for **cPanel without Node.js** using static export.

---

## 1) Folder structure (Next.js 14 App Router, frontend-only)
```
app/
  (public)/
    page.tsx
    [..catchall]/page.tsx   ← optional client-only dynamic route
  (protected)/
    layout.tsx              ← wraps with client guard
    page.tsx
  (private)/
    layout.tsx              ← wraps with stricter client guard
    page.tsx
  login/page.tsx
components/
  Header.tsx
  Footer.tsx
  AuthForm.tsx
lib/
  firebase-client.ts
  client-guard.tsx          ← common client-side guard + provider
public/
  .htaccess                 ← SPA rewrite on cPanel
next.config.js
.env.local
```

> Removed: `api/`, `firebase-admin.ts`, `auth.ts`, `backend.ts`, `middleware.ts`.

---

## 2) Environment
```bash
# .env.local (client-only)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

> No server secrets needed in frontend-only mode.

-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
# session
SESSION_COOKIE_NAME=__session
SESSION_MAX_AGE_DAYS=5
APP_JWT_SECRET=super-long-random-secret
```

---

## 3) Firebase (client)
```ts
// lib/firebase-client.ts
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(config)
export const firebaseAuth = getAuth(firebaseApp)
```

---

## 4) Common **client** guard (single place)
```tsx
// lib/client-guard.tsx
'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, getIdTokenResult, signOut, User } from 'firebase/auth'
import { usePathname, useRouter } from 'next/navigation'
import { firebaseAuth } from './firebase-client'

export type GuardMode = 'public' | 'protected' | 'private'

const AuthCtx = createContext<{ user: User | null } | null>(null)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async (u) => {
      if (!u) return setUser(null)
      try {
        // forces token refresh; if expired, Firebase refreshes automatically
        await u.getIdToken(true)
        setUser(u)
      } catch {
        setUser(null)
        await signOut(firebaseAuth)
      }
    })
    return () => unsub()
  }, [])
  return <AuthCtx.Provider value={{ user }}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function Guard({ mode, children }: { mode: GuardMode; children: React.ReactNode }) {
  const { user } = useAuth()
  const r = useRouter()
  const path = usePathname()

  useEffect(() => {
    if (mode === 'public') return
    if (!user) r.replace(`/login?next=${encodeURIComponent(path)}`)
  }, [mode, user, path, r])

  if (mode !== 'public' && !user) return null // or a spinner
  return <>{children}</>
}
```

> **One guard**: `<Guard mode="protected|private"/>` — reuse in any layout.

---

## 5) Layouts (client-only guard)
```tsx
// app/layout.tsx (Root)
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AuthProvider, useAuth } from '@/lib/client-guard'

function Chrome({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  return (
    <>
      {user && <Header />}
      {children}
      {user && <Footer />}
    </>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Chrome>{children}</Chrome>
        </AuthProvider>
      </body>
    </html>
  )
}
```

```tsx
// app/(protected)/layout.tsx
'use client'
import { Guard } from '@/lib/client-guard'
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <Guard mode="protected">{children}</Guard>
}
```

```tsx
// app/(private)/layout.tsx
'use client'
import { Guard } from '@/lib/client-guard'
export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return <Guard mode="private">{children}</Guard>
}
```

---

## 6) Pages (examples)
```tsx
// app/(public)/page.tsx
export default function Home() { return <div>Public Home (no login)</div> }
```

```tsx
// app/(public)/[..catchall]/page.tsx
'use client'
import { useParams } from 'next/navigation'
export default function PublicDynamic(){
  const params = useParams()
  return <div>Public Dynamic: {JSON.stringify(params)}</div>
}
```

```tsx
// app/(protected)/page.tsx
export default function Dashboard(){ return <div>Protected Dashboard (login required)</div> }
```

```tsx
// app/(private)/page.tsx
export default function PrivateArea(){ return <div>Private Area (login required)</div> }
```

```tsx
// app/login/page.tsx
'use client'
import { useState } from 'react'
import { firebaseAuth } from '@/lib/firebase-client'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Login(){
  const r = useRouter(); const q = useSearchParams()
  const next = q.get('next') || '/'
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [err,setErr] = useState('')
  async function onSubmit(e: React.FormEvent){
    e.preventDefault(); setErr('')
    try{
      await signInWithEmailAndPassword(firebaseAuth, email, password)
      r.replace(next)
    }catch{ setErr('Invalid credentials') }
  }
  return (
    <form onSubmit={onSubmit}>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" />
      <button type="submit">Login</button>
      {err && <p>{err}</p>}
    </form>
  )
}
```

---

## 7) Next.js 14 export config (for cPanel static hosting)
```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // static HTML export
  trailingSlash: true, // better for Apache hosting
}
module.exports = nextConfig
```

---

## 8) cPanel SPA routing (.htaccess)
```apache
# public/.htaccess
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

This makes all routes serve `index.html` so your App Router can handle client-side routing.

---

## 9) Deploy steps (cPanel without Node)
1. `npm i`
2. `npm run build`
3. `npx next export` → generates `/out`
4. Upload contents of `/out` to `public_html/` (or subfolder) via File Manager/FTP
5. Put the `.htaccess` above into `/out` (or root) so deep links work
6. Set Firebase auth domains in Firebase Console → Authentication → Settings

---

## 10) Notes
- **No Next API, no Middleware, no Firebase Admin** in this mode.
- Token expiry is handled by Firebase client; when user becomes `null`, `<Guard/>` redirects to `/login`.
- For "private" extra checks without backend, store flags (e.g., `role`, `active`) in **Firestore** user doc and read client-side.
- UI components (`Header`, `Footer`) stay **unchanged**; they render only when `user` exists.

---

## 13) Deployment on **cPanel**

### Option A: If cPanel supports **Node.js apps**
1. Go to your cPanel → *Setup Node.js App*.
2. Choose Node.js 18+ runtime.
3. Point app root to your project folder.
4. Run build:
   ```bash
   npm install
   npm run build
   npm start
   ```
5. App will run at `:3000` (or configured port).

### Option B: If cPanel does **NOT support Node.js** (common case)
- Next.js server features (middleware, API routes, SSR) may **not work directly**.
- Use one of these alternatives:
  - **Vercel** (best for Next.js 14).
  - **Netlify** (Next.js adapter).
  - **Docker container** → deploy on VPS, then proxy from cPanel.
  - Export static build (only if you don’t need SSR/auth):
    ```bash
    npm run build
    npm run export
    ```
    This outputs `/out` folder → upload to cPanel as static site.

### Recommended
- If you need **protected/private routes** and server-side guard: deploy on **Vercel** or **Node.js-enabled VPS**.
- If only public static pages: export + upload.

---

## 14) Frontend-only Implementation Notes
- You can also implement **only on frontend side** if backend session cookies not required.
- In this mode:
  - Use Firebase Client SDK (`getAuth`, `onAuthStateChanged`).
  - Protect routes client-side using a common `AuthGuard` component.
  - Redirect to `/login` when no user or token expired.
  - Header & Footer show conditionally when `user` exists.
- This is less secure (no backend verification) but works when you only host static frontend on cPanel.

---

## 15) Deployment on **cPanel** (Frontend-only)
- If your cPanel does **not support Node.js**, you cannot run Next.js API routes, middleware, or server-side guards.
- Solution: use **frontend-only Firebase Auth** (see section 14).
- Steps:
  1. Run build and export:
     ```bash
     npm run build
     npm run export
     ```
  2. Upload the `/out` folder contents to `public_html` in cPanel.
  3. Auth is handled fully client-side using Firebase SDK.
  4. All server-side code (`lib/auth.ts`, `api/session-login`, `middleware.ts`) is ignored in this mode.
- Limitation: backend allow/deny checks and session cookies are not used. Security is client-side only.
- Recommended: if you need backend verification, deploy to Vercel/Node VPS instead.

---

## 16) Next steps (paste into Cursor.md)
1. Add `.env.local` values.
2. `npm i firebase`
3. Create files exactly as above.
4. Run `npm run dev` locally (Next.js 14).
5. For frontend-only: use client-side guard; skip backend APIs.
6. Deploy to cPanel static hosting using `next export` if Node not supported.
7. Or deploy to Vercel/Node VPS for full features.
8. UI remains unchanged.

