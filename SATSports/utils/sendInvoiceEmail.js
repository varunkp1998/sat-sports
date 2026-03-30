const fs = require("fs");
const path = require("path");
const resend = require("./resend");

async function sendInvoiceEmail({ player, payment, invoicePath }) {
  try {
    const fullPath = path.join(__dirname, "..", invoicePath);
    const fileBuffer = fs.readFileSync(fullPath);

    await resend.emails.send({
      from: "SAT Sports <no-reply@sat-sports.in>",
      to: player.email,
      subject: "💳 Payment Successful - Invoice Attached",

      html: `
      <div style="font-family:Arial,sans-serif;background:#f5f7fb;padding:20px;">
        
        <div style="max-width:500px;margin:auto;background:white;border-radius:12px;overflow:hidden;">
          
          <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:20px;text-align:center;color:white;">
            <h2 style="margin:0;">SAT Sports 🎾</h2>
            <p style="opacity:0.8;margin-top:5px;">Payment Confirmation</p>
          </div>
    
          <div style="padding:20px;">
            <h3 style="margin-top:0;">Payment Successful ✅</h3>
    
            <p>Hi <b>${player.name}</b>,</p>
    
            <p>Your payment has been successfully received.</p>
    
            <div style="background:#f1f5f9;padding:15px;border-radius:10px;margin:15px 0;">
              <p><b>Amount:</b> ₹${payment.amount}</p>
              <p><b>Program:</b> ${payment.programName}</p>
              <p><b>Sessions:</b> ${payment.sessions}</p>
              <p><b>Plan:</b> ${payment.plan}</p>
            </div>
    
            <p>Your invoice is attached to this email.</p>
    
            <div style="text-align:center;margin-top:20px;">
              <a href="https://www.sat-sports.in"
                 style="background:#f97316;color:white;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:bold;">
                Go to Dashboard
              </a>
            </div>
          </div>
    
          <div style="text-align:center;padding:10px;font-size:12px;color:#64748b;">
            © SAT Sports
          </div>
    
        </div>
      </div>
      `,

      attachments: [
        {
          filename: `invoice_${payment.id}.pdf`,
          content: fileBuffer
        }
      ]
    });

    console.log("✅ Invoice email sent to:", player.email);

  } catch (emailErr) {
    console.error("❌ Invoice email failed:", emailErr);
  }
}

module.exports = sendInvoiceEmail;
