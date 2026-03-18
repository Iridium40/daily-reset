// lib/email/index.ts
// Uses Resend (https://resend.com) — free tier: 3,000 emails/month.
// Swap the implementation here if you prefer Postmark, SendGrid, etc.
//
// Setup:
//   npm install resend
//   Add RESEND_API_KEY and EMAIL_FROM to .env.local

import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!)
  return _resend
}
const FROM = process.env.EMAIL_FROM || 'noreply@thedailyreset.com'

// ── Password Reset ────────────────────────────────────────────────────────────
export async function sendPasswordResetEmail({
  to,
  resetUrl,
  orgName,
}: {
  to:       string
  resetUrl: string
  orgName?: string
}) {
  await getResend().emails.send({
    from:    FROM,
    to,
    subject: 'Reset your password — My Metabolic Reboot',
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #F7F2E8;">
        <h1 style="font-size: 28px; color: #2C2416; margin-bottom: 8px;">My Metabolic Reboot</h1>
        ${orgName ? `<p style="color: #7A6E5C; font-size: 14px; margin-bottom: 24px;">${orgName}</p>` : ''}
        <h2 style="font-size: 20px; color: #2C2416; margin-bottom: 16px;">Reset Your Password</h2>
        <p style="color: #7A6E5C; font-size: 14px; line-height: 1.6; margin-bottom: 28px;">
          We received a request to reset your password. Click the button below — this link expires in 1 hour.
        </p>
        <a href="${resetUrl}"
          style="display: inline-block; background: #C45A1A; color: white; font-size: 14px; font-weight: 600;
                 padding: 14px 32px; border-radius: 10px; text-decoration: none; margin-bottom: 24px;">
          Reset Password
        </a>
        <p style="color: #A89E8C; font-size: 12px; line-height: 1.6;">
          If you didn't request this, you can safely ignore this email.<br />
          This link will expire in 1 hour.
        </p>
        <hr style="border: none; border-top: 1px solid #E2D9C5; margin: 24px 0;" />
        <p style="color: #A89E8C; font-size: 11px;">© My Metabolic Reboot · All rights reserved</p>
      </div>
    `,
  })
}

// ── Coach Invite ──────────────────────────────────────────────────────────────
export async function sendCoachInviteEmail({
  to,
  inviteUrl,
  orgName,
  invitedBy,
}: {
  to:        string
  inviteUrl: string
  orgName:   string
  invitedBy: string
}) {
  await getResend().emails.send({
    from:    FROM,
    to,
    subject: `You're invited to join ${orgName} — My Metabolic Reboot`,
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #F7F2E8;">
        <h1 style="font-size: 28px; color: #2C2416; margin-bottom: 8px;">My Metabolic Reboot</h1>
        <p style="color: #7A6E5C; font-size: 14px; margin-bottom: 24px;">${orgName}</p>
        <h2 style="font-size: 20px; color: #2C2416; margin-bottom: 16px;">You're Invited!</h2>
        <p style="color: #7A6E5C; font-size: 14px; line-height: 1.6; margin-bottom: 8px;">
          <strong>${invitedBy}</strong> has invited you to join <strong>${orgName}</strong> as a coach admin on My Metabolic Reboot platform.
        </p>
        <p style="color: #7A6E5C; font-size: 14px; line-height: 1.6; margin-bottom: 28px;">
          Click below to create your account and start sharing the client hub with your clients.
        </p>
        <a href="${inviteUrl}"
          style="display: inline-block; background: #C45A1A; color: white; font-size: 14px; font-weight: 600;
                 padding: 14px 32px; border-radius: 10px; text-decoration: none; margin-bottom: 24px;">
          Accept Invite &amp; Create Account
        </a>
        <p style="color: #A89E8C; font-size: 12px; line-height: 1.6;">
          This invite link expires in 7 days. If you weren't expecting this, you can ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #E2D9C5; margin: 24px 0;" />
        <p style="color: #A89E8C; font-size: 11px;">© My Metabolic Reboot · All rights reserved</p>
      </div>
    `,
  })
}
