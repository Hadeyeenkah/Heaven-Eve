document.getElementById('paystack-order').addEventListener('click', function (e) {
    e.preventDefault();

    // Collect form data
    const fullName = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const amount = 5000 * 100; // Amount in kobo (e.g., 5000 NGN)

    // Validate form fields
    if (!fullName || !email) {
        alert('Please fill in all required fields.');
        return;
    }

    // Initialize Paystack
    const handler = PaystackPop.setup({
        key: 'YOUR_PUBLIC_KEY', // Replace with your actual Paystack public key
        email: email,
        amount: amount,
        currency: 'NGN',
        ref: 'REF' + Math.floor((Math.random() * 1000000000) + 1), // Generate a unique reference
        callback: function (response) {
            // Successful payment
            alert('Payment successful! Reference: ' + response.reference);

            // Optionally, submit the form data to the server
            document.getElementById('checkout-form').submit();
        },
        onClose: function () {
            alert('Transaction was not completed, please try again.');
        }
    });

    handler.openIframe(); // Open Paystack modal
});
// Example of cart data structure
const cartItems = [
    { id: 1, name: "Item 1", price: 25.00, quantity: 1 },
    { id: 2, name: "Item 2", price: 15.50, quantity: 2 },
  ];
  
  // Function to calculate total price
  function calculateTotal(cartItems) {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  }
  
  // Function to update the total price in the cart
  function updateTotalPrice() {
    const totalPrice = calculateTotal(cartItems);
    document.getElementById("cart-total-price").textContent = `$${totalPrice}`;
  }
  
  // Checkout button event listener
  document.getElementById("checkout-btn").addEventListener("click", () => {
    const totalPrice = calculateTotal(cartItems);
    
    // Your checkout logic here
    alert(`Proceeding to checkout with a total of $${totalPrice}`);
    
    // Example: Redirecting to a checkout page or sending data to a backend
    // window.location.href = "/checkout";
    // OR
    // sendCartToServer(cartItems);
  });
  
  // Initialize the cart total on page load
  updateTotalPrice();
  const cartItems = [
    { id: 1, name: "Item 1", price: 25.00, quantity: 1 },
    { id: 2, name: "Item 2", price: 15.50, quantity: 2 },
  ];
  
  document.getElementById("checkout-btn").addEventListener("click", () => {
    const cartData = encodeURIComponent(JSON.stringify(cartItems));
    window.location.href = `checkout.html?cart=${cartData}`;
  });
  
  

