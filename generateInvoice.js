const generateInvoice = (order, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text('Invoice', { align: 'center' }).moveDown();
    doc.fontSize(14).text(`Order ID: ${order.id || 'N/A'}`);
    doc.text(`Customer: ${order.name}`);
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
