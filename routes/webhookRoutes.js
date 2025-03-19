const express = require("express");
const crypto = require("crypto");
const { sendOrderEmail } = require("../utils/email");

const router = express.Router();

router.post("/webhook/paystack", async (req, res) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const payload = JSON.stringify(req.body);
    const hash = crypto.createHmac("sha512", secret).update(payload).digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
        console.warn("❌ Unauthorized webhook attempt.");
        return res.status(401).json({ message: "Unauthorized webhook signature" });
    }

    const event = req.body;
    console.log("⚡ Webhook Event Received:", event.event);

    if (event.event === "charge.success") {
        const paymentInfo = event.data;
        const orderData = {
            name: paymentInfo.customer.first_name || "N/A",
            email: paymentInfo.customer.email,
            phone: paymentInfo.customer.phone || "N/A",
            paymentMethod: paymentInfo.channel,
            cartItems: paymentInfo.metadata?.cartItems || [],
            totalAmount: paymentInfo.amount / 100,
            paymentReference: paymentInfo.reference,
        };

        try {
            await Order.create(orderData);
            await sendOrderEmail(orderData);
            console.log(`✅ Payment confirmed for ${paymentInfo.customer.email}`);
        } catch (error) {
            console.error("❌ Error processing webhook:", error);
        }
    }

    res.sendStatus(200);
});

module.exports = router;
