const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
  };
  return await transporter.sendMail(mailOptions);
};

// Email templates
exports.sendOrderConfirmation = async (order, user) => {
  const itemsList = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee">GHS ${item.price.toFixed(2)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee">GHS ${(item.quantity * item.price).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:20px">
      <div style="background:#1a1a2e;padding:20px;text-align:center;border-radius:8px 8px 0 0">
        <h1 style="color:#e94560;margin:0">Ketsy Wear</h1>
        <p style="color:#fff;margin:5px 0">Order Confirmation</p>
      </div>
      <div style="background:#fff;padding:30px;border-radius:0 0 8px 8px">
        <h2>Hi ${user.name},</h2>
        <p>Thank you for your order! We've received it and will begin processing shortly.</p>
        <div style="background:#f9f9f9;padding:15px;border-radius:8px;margin:20px 0">
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod.replace('-', ' ').toUpperCase()}</p>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#1a1a2e;color:#fff">
              <th style="padding:10px;text-align:left">Product</th>
              <th style="padding:10px;text-align:left">Qty</th>
              <th style="padding:10px;text-align:left">Price</th>
              <th style="padding:10px;text-align:left">Total</th>
            </tr>
          </thead>
          <tbody>${itemsList}</tbody>
        </table>
        <div style="margin-top:20px;text-align:right">
          <p>Subtotal: <strong>GHS ${order.itemsPrice.toFixed(2)}</strong></p>
          <p>Shipping: <strong>GHS ${order.shippingPrice.toFixed(2)}</strong></p>
          <p style="font-size:18px;color:#e94560">Total: <strong>GHS ${order.totalPrice.toFixed(2)}</strong></p>
        </div>
        <div style="background:#f9f9f9;padding:15px;border-radius:8px;margin-top:20px">
          <h3>Shipping To:</h3>
          <p>${order.shippingAddress.fullName}<br>
          ${order.shippingAddress.street}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.country}</p>
        </div>
        <p style="margin-top:20px;color:#666">If you have any questions, reply to this email or contact us at support@ketsywear.com</p>
      </div>
    </div>`;

  await sendEmail({ to: user.email, subject: `Order Confirmed - ${order.orderNumber}`, html });
};

exports.sendPasswordReset = async (user, resetUrl) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1a1a2e;padding:20px;text-align:center">
        <h1 style="color:#e94560">Ketsy Wear</h1>
      </div>
      <div style="padding:30px;background:#fff">
        <h2>Password Reset Request</h2>
        <p>Hi ${user.name}, you requested a password reset.</p>
        <p>Click the button below to reset your password. This link expires in 10 minutes.</p>
        <div style="text-align:center;margin:30px 0">
          <a href="${resetUrl}" style="background:#e94560;color:#fff;padding:12px 30px;text-decoration:none;border-radius:5px;font-weight:bold">
            Reset Password
          </a>
        </div>
        <p style="color:#666;font-size:13px">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
        <p style="color:#666;font-size:13px">Or copy this link: ${resetUrl}</p>
      </div>
    </div>`;

  await sendEmail({ to: user.email, subject: 'Password Reset - Ketsy Wear', html });
};

exports.sendShippingUpdate = async (order, user) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1a1a2e;padding:20px;text-align:center">
        <h1 style="color:#e94560">Ketsy Wear</h1>
      </div>
      <div style="padding:30px;background:#fff">
        <h2>Your Order Has Been Shipped! 🚚</h2>
        <p>Hi ${user.name}, great news! Your order ${order.orderNumber} is on its way.</p>
        ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
        ${order.trackingUrl ? `<p><a href="${order.trackingUrl}" style="color:#e94560">Track your package</a></p>` : ''}
        <p>Estimated delivery: 3-7 business days</p>
      </div>
    </div>`;

  await sendEmail({ to: user.email, subject: `Your Order ${order.orderNumber} Has Been Shipped!`, html });
};

module.exports.sendEmail = sendEmail;
