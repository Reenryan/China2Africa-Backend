import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",

  redact: {
    paths: [
      "password",
      "passwordHash",
      "token",
      "tokenHash",
      "authorization",
      "cookie",
      "set-cookie",
      "req.headers.authorization",
      "req.headers.cookie",
      "req.body.password",
      "req.body.token",
    ],
    censor: "[REDACTED]",
  },

  ...(process.env.NODE_ENV !== "production"
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        },
      }
    : {}),
});

export default logger;
