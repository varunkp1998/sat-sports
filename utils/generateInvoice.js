const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generateInvoice(data) {
  return new Promise((resolve, reject) => {
    const {
      paymentId,
      playerName,
      amount,
      plan,
      programName,
      sessions
    } = data;

    const fileName = `invoice_${paymentId}.pdf`;
    const filePath = path.join(__dirname, "../invoices", fileName);

    const doc = new PDFDocument();

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // HEADER
    doc.fontSize(20).text("Sports Academy Invoice", { align: "center" });

    doc.moveDown();

    doc.fontSize(12).text(`Invoice ID: ${paymentId}`);
    doc.text(`Player: ${playerName}`);
    doc.text(`Program: ${programName}`);
    doc.text(`Sessions: ${sessions}`);
    doc.text(`Plan: ${plan}`);

    doc.moveDown();

    doc.text(`Amount Paid: ₹${amount}`);

    doc.moveDown();
    doc.text(`Date: ${new Date().toLocaleDateString()}`);

    doc.moveDown();
    doc.text("Thank you for your payment!", { align: "center" });

    doc.end();

    stream.on("finish", () => {
      resolve(`/invoices/${fileName}`);
    });

    stream.on("error", reject);
  });
}

module.exports = generateInvoice;
