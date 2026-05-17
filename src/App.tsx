// ─────────────────────────────────────────────────────────────────────────────
// FILE: App.tsx
// Root component of the React application.
//
// Sets up the remaining provider stack and wires up the router.
// Provider order matters — inner providers can consume outer providers:
//
//   ThemeProvider  — dark/light mode. Wraps everything so any component can
//                    read or toggle the theme.
//   AuthProvider   — tracks the logged-in user. Wraps everything so any
//                    component can call useAuth().
//   Toaster        — renders the pop-up notification toasts (top-right corner).
//   RouterProvider — renders the correct page component based on the URL.
// ─────────────────────────────────────────────────────────────────────────────

import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { router } from '@/router';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        {/* Global toast notifications — any component can call toast('message') */}
        <Toaster position="top-right" />
        {/* The router decides which page to show based on the current URL */}
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}
