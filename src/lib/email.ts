import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendVerificationEmail(email: string, userId: string) {
  const url = `${process.env.NEXTAUTH_URL}/api/auth/verify?id=${userId}`
  await transporter.sendMail({
    from: `"Just Shop" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your Just Shop account',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2 style="color:#1E3A5F">Welcome to Just Shop! 🛍️</h2>
        <p>Click the button below to verify your account:</p>
        <a href="${url}" style="background:#F97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">
          Verify Email
        </a>
      </div>
    `,
  })
}

export async function sendOrderEmail(email: string, orderId: string, status: string) {
  await transporter.sendMail({
    from: `"Just Shop" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Update — ${status}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2 style="color:#1E3A5F">Order Status Update 📦</h2>
        <p>Your order <strong>#${orderId}</strong> is now <strong>${status}</strong>.</p>
        <a href="${process.env.NEXTAUTH_URL}/profile" style="background:#F97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">
          Track Order
        </a>
      </div>
    `,
  })
}