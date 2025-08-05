require('dotenv').config();
const db = require('../config/db');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

// 🧾 Generate PDF invoice
const generateInvoice = (order, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text('Invoice', { align: 'center' }).moveDown();
    doc.fontSize(14).text(`Customer: ${order.name}`);
    doc.text(`Email: ${order.email}`);
    doc.text(`Address: ${order.address}`);
    doc.text(`Phone: ${order.phone}`);
    doc.text(`Total: ₹${order.total}`).moveDown();

    doc.text('Items:');
    order.items.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} - ₹${item.price} x ${item.quantity}`);
    });

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
};

// 🛒 Place Order Controller
exports.placeOrder = async (req, res) => {
  const { name, email, address, phone, items, total } = req.body;

  console.log('🔔 Order received at backend:', req.body);

  try {
    // Save to DB
    console.log('📝 Inserting order into database...');
    await db.query(
      'INSERT INTO orders (name, email, address, phone, items, total) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, address, phone, JSON.stringify(items), total]
    );
    console.log('✅ Order inserted successfully!');

    // ✅ Generate invoice
    const order = { name, email, address, phone, items, total };
    const invoicePath = `invoices/invoice-${Date.now()}.pdf`;
    await generateInvoice(order, invoicePath);
    console.log('📄 Invoice generated:', invoicePath);

    // ✅ Send email with invoice
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Textile Store" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Order Confirmation - Textile Store',
      html: `
        <h2>Hi ${name},</h2>
        <p>Thank you for shopping with <strong>Textile Store</strong>.</p>
        <p>Your order total is ₹${total} and will be shipped soon.</p>
        <p>Delivery Address: ${address}</p>
        <p>Phone: ${phone}</p>
      `,
      attachments: [
        {
          filename: 'invoice.pdf',
          path: invoicePath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log('📨 Email with invoice sent successfully!');

    res.status(200).json({ success: true, message: 'Order placed and invoice sent.' });
  } catch (error) {
    console.error('❌ Order error:', error);
    res.status(500).json({ success: false, message: 'Order failed' });
  }
};
