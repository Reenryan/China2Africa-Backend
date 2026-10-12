import nodemailer from "nodemailer";

const requiredMailEnv = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "EMAIL_FROM",
];

for (const variable of requiredMailEnv) {
  if (!process.env[variable]) {
    throw new Error(
      `Missing required email configuration: ${variable}`
    );
  }
}

const port = Number(process.env.SMTP_PORT);

if (![465, 587].includes(port)) {
  throw new Error("SMTP_PORT must be 465 or 587.");
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure: port === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default transporter;
