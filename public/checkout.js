let orderItems = [];  // To store the selected items

// Track selected items when the user checks items in the menu
function updateOrderItems() {
    orderItems = [];
    const selectedItems = document.querySelectorAll(".menu:checked");

    selectedItems.forEach(item => {
        const name = item.getAttribute("data-name");
        const price = parseFloat(item.getAttribute("data-price"));
        const quantityInput = item.parentElement.querySelector(".item-quantity");
        const quantity = parseInt(quantityInput.value) || 1;  // Get quantity from input field or default to 1

        orderItems.push({ name, price, quantity });
    });
}

// Function to generate the invoice
function generateInvoice() {
    // Update the order items when generating the invoice
    updateOrderItems();

    // Get user details
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const address = document.getElementById("address").value;
    const phone = document.getElementById("phone").value;
    const paymentMethod = document.getElementById("payment-method").value;

    // Generate the order items list for the invoice
    let orderSummary = '';
    let totalAmount = 0;

    orderItems.forEach(item => {
        orderSummary += `
            <p><strong>${item.name} x${item.quantity}:</strong> $${(item.price * item.quantity).toFixed(2)}</p>
        `;
        totalAmount += item.price * item.quantity;
    });

    // Generate the invoice summary
    const invoiceSummary = `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Shipping Address:</strong> ${address}</p>
        <p><strong>Phone Number:</strong> ${phone}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod === "transfer" ? "Bank Transfer" : "Debit Card"}</p>
        
        <h4>Order Summary:</h4>
        ${orderSummary}
        <hr>
        <p><strong>Total Amount: </strong>$${totalAmount.toFixed(2)}</p>
    `;
    
    // Show the invoice section and inject the invoice summary
    document.getElementById("invoice-summary").innerHTML = invoiceSummary;
    document.getElementById("invoice-section").style.display = "block";

    // Show the payment details if the user selects bank transfer
    if (paymentMethod === "transfer") {
        showTransferDetails();
    } else {
        document.getElementById("payment-details").innerHTML = "";
    }
}

// Show transfer details if the user selects bank transfer
function showTransferDetails() {
    // Account details for bank transfer (can be replaced with real data)
    const accountNumber = "123-456-789";
    const bankName = "Heaven Bank";
    const accountHolder = "Heaven and Eve Coffee Shop";

    // Display bank transfer details
    const paymentDetailsHTML = `
        <h4>Bank Transfer Details</h4>
        <p><strong>Account Holder:</strong> ${accountHolder}</p>
        <p><strong>Bank Name:</strong> ${bankName}</p>
        <p><strong>Account Number:</strong> ${accountNumber}</p>
    `;
    document.getElementById("payment-details").innerHTML = paymentDetailsHTML;
}

// Function to handle order confirmation
function confirmOrder() {
    alert("Your order has been confirmed! Thank you for shopping with us.");
}

// To handle changes in quantity input (optional)
document.querySelectorAll(".item-quantity").forEach(input => {
    input.addEventListener("input", updateOrderItems);  // Update order when quantity changes
});
