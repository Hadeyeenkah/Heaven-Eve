// Initialize Stripe.js with your public key
const stripe = Stripe('your-publishable-key-here'); // Replace with your Stripe public key
const elements = stripe.elements();

// Create an instance of the card Element
const card = elements.create('card');

// Add the card Element to the form
card.mount('#card-element');

// Handle form submission
const form = document.getElementById('payment-form');
const submitButton = document.getElementById('submit-button');
const paymentMessage = document.getElementById('payment-message');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Disable the submit button to prevent multiple clicks
    submitButton.disabled = true;

    // Create a PaymentMethod using the card Element
    const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: card,
    });

    if (error) {
        // If an error occurs, show the error message
        paymentMessage.textContent = error.message;
        submitButton.disabled = false;
    } else {
        // Send the PaymentMethod ID to your server for payment processing
        const paymentResponse = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ payment_method: paymentMethod.id }),
        });

        const paymentData = await paymentResponse.json();

        if (paymentData.error) {
            // If the server returns an error, display it
            paymentMessage.textContent = paymentData.error;
            submitButton.disabled = false;
        } else {
            // Confirm the payment using the client secret from the server
            const { paymentIntent, error } = await stripe.confirmCardPayment(paymentData.clientSecret);

            if (error) {
                paymentMessage.textContent = error.message;
                submitButton.disabled = false;
            } else {
                // Payment successful
                paymentMessage.textContent = 'Payment Successful! Thank you for your purchase.';
                submitButton.disabled = true;
            }
        }
    }
});
