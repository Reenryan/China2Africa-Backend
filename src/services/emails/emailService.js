import transporter from "../../config/mailer.js";

const FROM = process.env.EMAIL_FROM;

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export async function sendVerificationEmail({
  email,
  firstName,
  code,
}) {
  const safeName = escapeHtml(firstName);

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Verify your China2Africa account",
    text: `Hello ${firstName},

Thank you for registering with China2Africa.

Your email verification code is: ${code}

This code expires in 10 minutes. If you did not create this account, you can ignore this email.

China2Africa Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #222; line-height: 1.6;">
        <h2 style="color: #163b63;">Verify your China2Africa account</h2>

        <p>Hello ${safeName},</p>

        <p>Thank you for registering with China2Africa.
        Please use the verification code below to verify your email address.</p>

        <div style="margin: 28px 0; padding: 20px; background: #f3f6fa; text-align: center; border-radius: 8px;">
          <div style="font-size: 12px; color: #555;">YOUR VERIFICATION CODE</div>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #163b63;">
            ${code}
          </div>
        </div>

        <p>This code expires in <strong>10 minutes</strong>.
        Do not share it with anyone.</p>

        <p>If you did not create this account, you can ignore this email.</p>

        <p>Kind regards,<br/><strong>China2Africa Team</strong></p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail({
  email,
  firstName,
}) {
  const safeName = escapeHtml(firstName);

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Welcome to China2Africa!",
    text: `Welcome, ${firstName}, to China2Africa!

Your email has been verified and your account is ready.

We're here to help you source products from China and coordinate shipping to Africa.

Thank you for joining us!

China2Africa Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #222; line-height: 1.7;">
        <h1 style="color: #163b63;">Welcome to China2Africa!</h1>

        <p>Hello ${safeName},</p>

        <p>We're delighted to welcome you to <strong>China2Africa</strong>.</p>

        <p>Your email address has been verified, and your account is ready.</p>

        <p>We're here to help you source products from China,
        coordinate procurement, consolidate cargo, and arrange delivery across Africa.</p>

        <div style="margin: 24px 0; padding: 18px; background: #f3f6fa; border-radius: 8px;">
          <strong>Source from China. Ship to Africa. Grow your business.</strong>
        </div>

        <p>Thank you for choosing China2Africa. We look forward to supporting your sourcing journey.</p>

        <p>Kind regards,<br/><strong>China2Africa Team</strong></p>
      </div>
    `,
  });
}
