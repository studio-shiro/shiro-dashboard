import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Shiro Studio <noreply@shirostudio.co>";

export async function sendInviteEmail({
  recipientName,
  recipientEmail,
  businessName,
  actionLink,
}: {
  recipientName: string;
  recipientEmail: string;
  businessName: string;
  actionLink: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: recipientEmail,
    subject: `Tu cuenta en ${businessName} está lista`,
    html: buildInviteHtml({ recipientName, businessName, actionLink }),
  });
}

function buildInviteHtml({
  recipientName,
  businessName,
  actionLink,
}: {
  recipientName: string;
  businessName: string;
  actionLink: string;
}): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invitación a ${businessName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:18px;font-weight:700;color:#18181b;letter-spacing:-0.5px;">
                Shiro Studio
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:12px;padding:40px 36px;border:1px solid #e4e4e7;">

              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.6px;">
                Invitación
              </p>
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#18181b;line-height:1.3;">
                Hola, ${recipientName}
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.6;">
                Fuiste invitado a gestionar <strong style="color:#18181b;">${businessName}</strong>
                en Shiro Studio. Hacé click en el botón para activar tu cuenta y crear tu contraseña.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td>
                    <a href="${actionLink}"
                       style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;">
                      Activar mi cuenta
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#a1a1aa;">
                Si el botón no funciona, copiá y pegá este enlace en tu navegador:
              </p>
              <p style="margin:0;font-size:12px;color:#a1a1aa;word-break:break-all;">
                ${actionLink}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">
                Este enlace expira en 24 horas. Si no esperabas esta invitación, podés ignorar este email.
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#d4d4d8;">
                © Shiro Studio
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
