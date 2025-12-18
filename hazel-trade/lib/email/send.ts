import nodemailer from 'nodemailer'

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface SendInviteEmailParams {
  to: string
  companyName: string
  contactName: string
  role: 'BUYER' | 'SELLER'
  dealNumber: string
  dealDetails: {
    product: string
    quantity: string
    value: string
    location: string
  }
  inviteLink: string
  brokerName: string
}

export async function sendInviteEmail({
  to,
  companyName,
  contactName,
  role,
  dealNumber,
  dealDetails,
  inviteLink,
  brokerName,
}: SendInviteEmailParams) {
  const roleLabel = role === 'BUYER' ? 'Buyer' : 'Seller'

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #f9fafb;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .deal-box {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .deal-box h3 {
          margin-top: 0;
          color: #1f2937;
        }
        .deal-detail {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .deal-detail:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: 600;
          color: #6b7280;
        }
        .value {
          color: #1f2937;
        }
        .button {
          display: inline-block;
          background: #2563eb;
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #6b7280;
          font-size: 12px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        .badge {
          display: inline-block;
          background: #dbeafe;
          color: #1e40af;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">= Hazel Trade</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Zero-Knowledge Commodity Trading Platform</p>
        </div>

        <div class="content">
          <h2>Hello ${contactName},</h2>

          <p>You've been invited to participate as the <strong>${roleLabel}</strong> in a commodity trading deal on Hazel Trade.</p>

          <div class="deal-box">
            <h3>Deal Information</h3>
            <div class="deal-detail">
              <span class="label">Deal Number:</span>
              <span class="value"><strong>${dealNumber}</strong></span>
            </div>
            <div class="deal-detail">
              <span class="label">Product:</span>
              <span class="value">${dealDetails.product}</span>
            </div>
            <div class="deal-detail">
              <span class="label">Quantity:</span>
              <span class="value">${dealDetails.quantity}</span>
            </div>
            <div class="deal-detail">
              <span class="label">Estimated Value:</span>
              <span class="value">${dealDetails.value}</span>
            </div>
            <div class="deal-detail">
              <span class="label">Location:</span>
              <span class="value">${dealDetails.location}</span>
            </div>
            <div class="deal-detail">
              <span class="label">Broker:</span>
              <span class="value">${brokerName}</span>
            </div>
          </div>

          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Click the button below to review the deal details</li>
            <li>Create your account or sign in</li>
            <li>Upload your ${role === 'BUYER' ? 'Proof of Funds (POF)' : 'Proof of Product (POP)'} for ZK verification</li>
            <li>Once both parties verify, the deal will be matched and you can proceed through the 12-step trading workflow</li>
          </ol>

          <div style="text-align: center;">
            <a href="${inviteLink}" class="button">Review Deal & Accept Invite</a>
          </div>

          <p style="margin-top: 30px;">
            <span class="badge">= Zero-Knowledge Privacy</span><br/>
            Your sensitive financial information is protected with zero-knowledge proofs.
            The other party will only see verification status, not your actual documents.
          </p>

          <p style="font-size: 14px; color: #6b7280;">
            This invite link will expire in 30 days. If you have any questions, please contact ${brokerName}.
          </p>
        </div>

        <div class="footer">
          <p>� ${new Date().getFullYear()} Hazel Trade. All rights reserved.</p>
          <p>Secure Commodity Trading with Zero-Knowledge Verification</p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
Hello ${contactName},

You've been invited to participate as the ${roleLabel} in a commodity trading deal on Hazel Trade.

Deal Information:
- Deal Number: ${dealNumber}
- Product: ${dealDetails.product}
- Quantity: ${dealDetails.quantity}
- Estimated Value: ${dealDetails.value}
- Location: ${dealDetails.location}
- Broker: ${brokerName}

To accept this invitation and proceed with the deal, please visit:
${inviteLink}

Next Steps:
1. Review the deal details
2. Create your account or sign in
3. Upload your ${role === 'BUYER' ? 'Proof of Funds (POF)' : 'Proof of Product (POP)'} for ZK verification
4. Once both parties verify, the deal will be matched

Your sensitive information is protected with zero-knowledge proofs.

This invite link will expire in 30 days.

Best regards,
Hazel Trade Platform
  `

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Hazel Trade" <${process.env.SMTP_USER}>`,
      to,
      subject: `Deal Invitation: ${dealNumber} - ${roleLabel} Role`,
      text: textContent,
      html: htmlContent,
    })

    console.log(` Invite email sent to ${to} (${role})`)
    return { success: true }
  } catch (error) {
    console.error(` Failed to send email to ${to}:`, error)
    return { success: false, error }
  }
}

// Test email configuration
export async function testEmailConfig() {
  try {
    await transporter.verify()
    console.log(' Email configuration is valid')
    return true
  } catch (error) {
    console.error(' Email configuration error:', error)
    return false
  }
}
