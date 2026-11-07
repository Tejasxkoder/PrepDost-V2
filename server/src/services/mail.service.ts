import nodemailer from "nodemailer"
import type { Transporter } from "nodemailer"
import { logger } from "../utils/logger.js"

export interface MailMessage {
  to: string
  subject: string
  text: string
  html: string
}

let transport: Transporter | null | undefined

const consoleFallbackAllowed = () =>
  process.env.NODE_ENV !== "production" || process.env.EMAIL_TO_CONSOLE === "true"

const getTransport = (): Transporter | null => {
  if (transport !== undefined) return transport

  const host = process.env.SMTP_HOST
  if (!host) {
    transport = null
    return transport
  }

  const port = Number(process.env.SMTP_PORT) || 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    ...(user && pass ? { auth: { user, pass } } : {}),
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  })
  return transport
}

export const mailFrom = (): string =>
  process.env.MAIL_FROM ?? "PrepDost <no-reply@localhost>"

export const sendMail = async (message: MailMessage): Promise<void> => {
  const smtp = getTransport()

  if (!smtp) {
    if (!consoleFallbackAllowed()) {
      throw new Error("Email is not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS, MAIL_FROM)")
    }
    logger.warn(
      "mail.dev",
      "SMTP not configured, printing the email instead of sending it",
      { to: message.to, subject: message.subject, text: message.text }
    )
    return
  }

  await smtp.sendMail({
    from: mailFrom(),
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  })
}

export const otpEmail = (
  purpose: "verify" | "reset",
  code: string,
  ttlMinutes: number
): Pick<MailMessage, "subject" | "text" | "html"> => {
  const verify = purpose === "verify"
  const subject = verify
    ? `${code} is your PrepDost verification code`
    : `${code} is your PrepDost password reset code`
  const intro = verify
    ? "Use this code to verify your email and finish creating your PrepDost account."
    : "Use this code to reset your PrepDost password."
  const outro = verify
    ? "If you didn't sign up, you can ignore this email."
    : "If you didn't ask to reset your password, you can ignore this email. Your password has not changed."

  const text = [
    intro,
    "",
    `Your code: ${code}`,
    `It expires in ${ttlMinutes} minutes.`,
    "",
    outro,
  ].join("\n")

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f2f5f1;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f1912">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px">
      <tr><td>
        <p style="margin:0 0 4px;font-size:18px;font-weight:600">PrepDost</p>
        <p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#4a5a4f">${intro}</p>
        <p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7b70">Your code</p>
        <p style="margin:0 0 20px;font-size:32px;font-weight:700;letter-spacing:.3em;font-family:ui-monospace,Menlo,Consolas,monospace">${code}</p>
        <p style="margin:0 0 20px;font-size:13px;color:#4a5a4f">This code expires in ${ttlMinutes} minutes.</p>
        <p style="margin:0;font-size:12px;line-height:1.5;color:#6b7b70">${outro}</p>
      </td></tr>
    </table>
  </body>
</html>`


  return { subject, text, html }
}
