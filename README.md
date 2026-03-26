# Shell App (個人工具平台)

This is the **host application** for the micro-frontend platform. It provides:

- **Authentication & Authorization**: Login, password management, user management
- **Unified Layout**: Sidebar navigation and top bar
- **App Router**: Routes to different micro-frontend apps
- **Module Federation Host**: Loads remote micro-frontend modules

## Tech Stack

- **Vue 3.5.25** - Progressive JavaScript framework
- **Vue Router 4.6.4** - Official router for Vue.js
- **Pinia 3.0.4** - State management
- **Axios 1.13.6** - HTTP client
- **Module Federation** - Micro-frontend architecture via @module-federation/vite
- **Vite 7.3** - Build tool

## Project Structure

```
shell/
├── src/
│   ├── api.js                 # Axios instance with auth interceptors
│   ├── main.js                # App entry point
│   ├── App.vue                # Root component with layout
│   ├── layout/
│   │   ├── SideNav.vue        # Sidebar navigation
│   │   └── TopBar.vue         # Top bar with user info
│   ├── router/
│   │   └── index.js           # Vue Router configuration
│   ├── stores/
│   │   └── auth.js            # Authentication store (Pinia)
│   └── views/
│       ├── HomeView.vue       # Landing page with app grid
│       ├── LoginView.vue      # Login form
│       ├── ChangePasswordView.vue  # Password change form
│       ├── UserManagementView.vue  # Admin user management
│       └── RemoteAppView.vue  # Container for remote apps
├── index.html
├── vite.config.js             # Vite + Module Federation config
└── package.json
```

## Development

```bash
npm install
npm run dev   # Starts on http://localhost:5173
```

## Build

```bash
npm run build
npm run preview
```

## Module Federation Configuration

The shell is configured to load remote apps:

```javascript
remotes: {
  swearJar: {
    type: 'module',
    name: 'swearJar',
    entry: 'http://localhost:5174/mf-manifest.json',
  },
}
```

Shared dependencies (singleton):
- `vue`
- `vue-router`
- `pinia`

## Routes

- `/` - Home (app grid)
- `/login` - Login page
- `/change-password` - Change password
- `/admin/users` - User management (admin only)
- `/swear-jar/*` - Swear Jar remote app

## API Proxy

The Vite dev server proxies `/api` to the backend gateway at `http://localhost:5200`.

## Environment Variables

- `VITE_API_URL` - Backend API base URL (defaults to empty string, uses proxy in dev)
- `VITE_BASE_PATH` - Base path for the app (defaults to `/`)

## Auth Store

Located at `src/stores/auth.js`, provides:

- Login/logout
- Password change
- Token refresh
- User management (admin)
- App access management (admin)

State persisted to localStorage:
- `token`
- `refreshToken`
- `displayName`
- `role`
- `mustChangePassword`
- `apps` (array of accessible apps)

## Adding a New Remote App

1. Add the remote to `vite.config.js`:
```javascript
remotes: {
  myApp: {
    type: 'module',
    name: 'myApp',
    entry: 'http://localhost:5175/mf-manifest.json',
  },
}
```

2. Add the route in `src/router/index.js`:
```javascript
{ 
  path: '/my-app/:pathMatch(.*)*', 
  name: 'MyApp',
  component: () => import('../views/RemoteAppView.vue'),
  meta: { requiresAuth: true, appId: 'my-app' }
}
```

3. The app will appear in the sidebar automatically if it's in the `auth.apps` array.
