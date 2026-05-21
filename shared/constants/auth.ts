export const COOKIE_TOKEN = "auth_token";

/** Generic login failure message (does not reveal whether the user exists). */
export const LOGIN_ERROR_GENERIC =
  "Correo o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.";
export const COOKIE_USER_INFO = "user_info";

// 7 days
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

// Public auth routes (login / register / forgot-password / reset-password)
export const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

// Routes that require a valid token.
// "/" is matched exactly; all others are matched by prefix.
export const PROTECTED_ROUTES = ["/", "/transactions", "/budgets", "/goals", "/ai", "/categories"];
