import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!)
  return _resend
}
const FROM = process.env.EMAIL_FROM || 'noreply@thedailyreset.com'
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function sendHipaaIntakeEmail({
  to,
  clientName,
  token,
}: {
  to: string
  clientName: string
  token: string
}) {
  const intakeUrl = `${SITE}/intake/${token}`

  await getResend().emails.send({
    from: FROM,
    to,
    subject: 'Please Complete Your Health Information — My Metabolic Reboot',
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #F7F2E8;">
        <h1 style="font-size: 28px; color: #2C2416; margin-bottom: 8px;">My Metabolic Reboot</h1>
        <h2 style="font-size: 20px; color: #2C2416; margin-bottom: 16px;">Health Information Request</h2>
        <p style="color: #7A6E5C; font-size: 14px; line-height: 1.6; margin-bottom: 8px;">
          Hi ${clientName},
        </p>
        <p style="color: #7A6E5C; font-size: 14px; line-height: 1.6; margin-bottom: 28px;">
          Thank you for booking your counseling session! Before your first appointment, we need a few details about your health history. This information is kept confidential and secure.
        </p>
        <a href="${intakeUrl}"
          style="display: inline-block; background: #C45A1A; color: white; font-size: 14px; font-weight: 600;
                 padding: 14px 32px; border-radius: 10px; text-decoration: none; margin-bottom: 24px;">
          Complete Health Form →
        </a>
        <p style="color: #A89E8C; font-size: 12px; line-height: 1.6; margin-top: 16px;">
          This link is unique to you. Please do not share it. Your information is protected under HIPAA guidelines.
        </p>
        <hr style="border: none; border-top: 1px solid #E2D9C5; margin: 24px 0;" />
        <p style="color: #A89E8C; font-size: 11px;">© My Metabolic Reboot · All rights reserved</p>
      </div>
    `,
  })
}
