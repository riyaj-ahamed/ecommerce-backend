const PDFDocument = require('pdfkit');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Generate PDF Invoice
function generateInvoice(order, filePath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(`Order ID: ${order.id}`);
    doc.text(`Customer: ${order.name}`);
    doc.text(`Email: ${order.email}`);
    doc.text(`Total: ₹${order.total}`);
    doc.moveDown();

    doc.text('Items:');
    order.items.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} - ₹${item.price} x ${item.qty}`);
    });

    doc.end();

    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

// Send Email with PDF Invoice
async function sendInvoiceEmail(order, filePath) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GMAIL_USER,
  pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Textile Store" <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: 'Your Order Invoice',
    text: 'Thank you for your purchase. Invoice attached.',
    attachments: [
      {
        filename: 'invoice.pdf',
        path: filePath,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
  console.log('📧 Email sent successfully with invoice!');
}

// Sample usage
const sampleOrder = {
  id: 'INV-20250805-001',
  name: 'Riyas Ahamed',
  email: 'receiver@example.com',
  total: 1499,
  items: [
    { name: 'Silk Kurti', price: 499, qty: 1 },
    { name: 'Cotton Saree', price: 1000, qty: 1 },
  ],
};

const invoicePath = `./invoice-${sampleOrder.id}.pdf`;

(async () => {
  try {
    await generateInvoice(sampleOrder, invoicePath);
    console.log('📄 PDF invoice generated!');
    await sendInvoiceEmail(sampleOrder, invoicePath);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
