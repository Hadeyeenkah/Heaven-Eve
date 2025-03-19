const axios = require("axios");

const verifyTransaction = async (reference) => {
    try {
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
        });

        if (response.data.status && response.data.data.status === "success") {
            console.log("✅ Payment verified:", response.data.data);
            return response.data.data;
        } else {
            throw new Error("Payment verification failed");
        }
    } catch (error) {
        console.error("❌ Error verifying transaction:", error.message);
        throw new Error("Payment verification error");
    }
};

module.exports = { verifyTransaction };
