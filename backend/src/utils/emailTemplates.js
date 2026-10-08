/**
 * Email HTML templates for ROUNDCode (Round Table DTU)
 * Styled with responsive dark-mode layout and brand styling.
 */

export const getRegistrationApprovalEmailHtml = ({
  name,
  personalEmail,
  dtuEmail,
  tempPassword,
  loginUrl,
}) => {
  const url = loginUrl || `${process.env.CLIENT_URL || 'http://localhost:3000'}/login`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ROUNDCode — Membership Registration Approved</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #090a0f; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #12131b; border: 1px solid #202230; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #a3ff20 0%, #b4a2f8 100%); line-height: 4px; font-size: 4px;">&nbsp;</td>
          </tr>

          <!-- Header Section -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; color: #ffffff;">
                      ROUND<span style="color: #a3ff20;">CODE</span>
                    </span>
                    <span style="display: block; font-size: 11px; color: #8f92a3; margin-top: 2px;">
                      by Roundtable DTU
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; font-size: 11px; font-weight: 700; color: #a3ff20; background-color: rgba(163, 255, 32, 0.12); border: 1px solid rgba(163, 255, 32, 0.3); padding: 4px 12px; border-radius: 9999px;">
                      ✔ Approved
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Greeting -->
          <tr>
            <td style="padding: 10px 36px 24px 36px;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #ffffff; line-height: 1.3;">
                Welcome to ROUNDCode, ${name}!
              </h1>
              <p style="margin: 0; font-size: 14px; color: #a1a1aa; line-height: 1.6;">
                Your Round Table DTU membership registration has been officially approved. Your developer profile has been created and you now have access to weekly Problem of the Week (POTW) challenges, peer leaderboards, and rating tracking.
              </p>
            </td>
          </tr>

          <!-- Credentials Box -->
          <tr>
            <td style="padding: 0 36px 24px 36px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #090a0f; border: 1px solid #202230; border-radius: 18px; padding: 24px;">
                <tr>
                  <td>
                    <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #71717a; margin-bottom: 6px;">
                      Login Email
                    </span>
                    <span style="display: block; font-size: 14px; font-weight: 600; color: #ffffff; font-family: monospace;">
                      ${personalEmail}
                    </span>

                    <div style="height: 1px; background-color: #202230; margin: 18px 0;"></div>

                    <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #71717a; margin-bottom: 8px;">
                      Temporary Access Password
                    </span>
                    <div style="background-color: #12131b; border: 1px dashed rgba(163, 255, 32, 0.45); border-radius: 12px; padding: 12px 16px; text-align: center;">
                      <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 18px; font-weight: 800; color: #a3ff20; letter-spacing: 2px;">
                        ${tempPassword}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td style="padding: 0 36px 28px 36px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <a href="${url}" target="_blank" style="display: inline-block; background-color: #a3ff20; color: #000000; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; padding: 14px 36px; border-radius: 14px; text-decoration: none; box-shadow: 0 4px 12px rgba(163, 255, 32, 0.25);">
                      Log In to ROUNDCode &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <span style="display: block; font-size: 12px; color: #a1a1aa; margin-top: 14px;">
                You can update this password later whenever you want in your profile settings.
              </span>
            </td>
          </tr>

          <!-- Footer Divider & Content -->
          <tr>
            <td style="border-top: 1px solid #202230; padding: 24px 36px 32px 36px; text-align: center; background-color: #0e0f16;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #a1a1aa;">
                Round Table DTU &bull; Delhi Technological University
              </p>
              <p style="margin: 0; font-size: 11px; color: #52525b; line-height: 1.5;">
                This automated email was sent to ${personalEmail}. If you did not apply for membership, please contact the administrators.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

export const getPasswordResetEmailHtml = ({
  name,
  resetLink,
}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ROUNDCode — Password Reset Request</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #090a0f; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #12131b; border: 1px solid #202230; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #b4a2f8 0%, #a3ff20 100%); line-height: 4px; font-size: 4px;">&nbsp;</td>
          </tr>

          <!-- Header Section -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: left;">
              <span style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; color: #ffffff;">
                ROUND<span style="color: #a3ff20;">CODE</span>
              </span>
              <span style="display: block; font-size: 11px; color: #8f92a3; margin-top: 2px;">
                by Roundtable DTU
              </span>
            </td>
          </tr>

          <!-- Hero Greeting -->
          <tr>
            <td style="padding: 10px 36px 24px 36px;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #ffffff; line-height: 1.3;">
                Password Reset Request
              </h1>
              <p style="margin: 0; font-size: 14px; color: #a1a1aa; line-height: 1.6;">
                Hello ${name || 'Member'},<br><br>
                We received a request to reset the password for your ROUNDCode account. Click the button below to choose a new password. This secure link expires in <strong>1 hour</strong>.
              </p>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td style="padding: 0 36px 28px 36px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" target="_blank" style="display: inline-block; background-color: #b4a2f8; color: #000000; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; padding: 14px 36px; border-radius: 14px; text-decoration: none; box-shadow: 0 4px 12px rgba(180, 162, 248, 0.25);">
                      Reset Password &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <span style="display: block; font-size: 12px; color: #71717a; margin-top: 16px; word-break: break-all;">
                Or copy this URL into your browser:<br>
                <a href="${resetLink}" style="color: #a3ff20; text-decoration: underline;">${resetLink}</a>
              </span>
            </td>
          </tr>

          <!-- Footer Divider & Content -->
          <tr>
            <td style="border-top: 1px solid #202230; padding: 24px 36px 32px 36px; text-align: center; background-color: #0e0f16;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #a1a1aa;">
                Round Table DTU &bull; Delhi Technological University
              </p>
              <p style="margin: 0; font-size: 11px; color: #52525b; line-height: 1.5;">
                If you did not request this password reset, please ignore this email. Your current password remains secure.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};
