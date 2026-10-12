const isProduction = process.env.NODE_ENV === "production";

export const ACCESS_TOKEN_COOKIE = "c2a_access";

export const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;

export const accessCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};

export function setAccessTokenCookie(res, token) {
  res.cookie(ACCESS_TOKEN_COOKIE, token, {
    ...accessCookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
}

export function clearAccessTokenCookie(res) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, accessCookieOptions);
}

// The cookie is inaccessible to browser JavaScript, which reduces token theft through many XSS scenarios. It does not eliminate XSS or CSRF risks.