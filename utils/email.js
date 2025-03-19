const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOrderEmail = async (orderData) => {
    const { email, name, totalAmount, paymentReference } = orderData;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Order Confirmation",
        text: `Hello ${name},\n\nYour order has been received.\nTotal: $${totalAmount}\nReference: ${paymentReference}\n\nThank you!`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Order email sent to ${email}`);
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
};

module.exports = { sendOrderEmail };
