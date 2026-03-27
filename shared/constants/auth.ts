export const COOKIE_TOKEN = "auth_token";
export const COOKIE_USER_INFO = "user_info";

// 7 días
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

// Rutas públicas de autenticación (login / registro)
export const AUTH_ROUTES = ["/login", "/register"];

// Rutas que requieren un token válido.
// "/" se compara de forma exacta; el resto se trata como prefijo.
export const PROTECTED_ROUTES = ["/", "/transactions", "/budgets", "/goals", "/ai", "/categories"];
