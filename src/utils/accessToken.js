import jwt from "jsonwebtoken";

const JWT_ISSUER = "china2africa-api";
const JWT_AUDIENCE = "china2africa-web";

function getJwtSecret() {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error(
      "JWT_ACCESS_SECRET must contain at least 32 bytes."
    );
  }

  return secret;
}

export function signAccessToken(user) {
  return jwt.sign(
    {
      ver: user.tokenVersion,
    },
    getJwtSecret(),
    {
      algorithm: "HS256",
      subject: user.id,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret(), {
    algorithms: ["HS256"],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
}