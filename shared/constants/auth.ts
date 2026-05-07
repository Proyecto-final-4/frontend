export const COOKIE_TOKEN = "auth_token";
export const COOKIE_USER_INFO = "user_info";

// 7 days
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

// Public auth routes (login / register)
export const AUTH_ROUTES = ["/login", "/register"];

// Routes that require a valid token.
// "/" is matched exactly; all others are matched by prefix.
export const PROTECTED_ROUTES = ["/", "/transactions", "/budgets", "/goals", "/ai", "/categories"];
