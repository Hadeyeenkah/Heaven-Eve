let cart = []; // Store items added to the cart
let totalAmount = 0; // Total price of all items
let userDetails = {
    name: "John Doe", // Example name
    phone: "123-456-7890", // Example phone number
    address: "123 Main St, Anytown, USA" // Example address
};

let trackingNumber = "TRK123456789"; // Example tracking number

// Function to add items to the cart and update total
function addToCart(itemName, itemPrice, quantityId) {
    const quantity = parseInt(document.getElementById(quantityId).value);
    if (isNaN(quantity) || quantity <= 0) {
        alert("Please enter a valid quantity.");
        return;
    }

    const existingItem = cart.find(item => item.itemName === itemName);

    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.totalPrice += itemPrice * quantity;
    } else {
        cart.push({
            itemName,
            itemPrice,
            quantity,
            totalPrice: itemPrice * quantity
        });
    }

    totalAmount += itemPrice * quantity;

    // Update cart display and total count
    document.getElementById('cart-count').innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Function to generate and display the invoice
function generateInvoice() {
    // Set user details
    document.getElementById("user-name").innerText = userDetails.name;
    document.getElementById("user-phone").innerText = userDetails.phone;
    document.getElementById("user-address").innerText = userDetails.address;

    // Set tracking number
    document.getElementById("tracking-number-value").innerText = trackingNumber;

    // Set ordered items
    const itemList = document.getElementById("item-list");
    itemList.innerHTML = ""; // Clear previous items

    cart.forEach(item => {
        const itemDiv = document.createElement('li');
        itemDiv.innerText = `${item.quantity} x ${item.itemName} - N${item.totalPrice.toLocaleString()}`;
        itemList.appendChild(itemDiv);
    });

    // Set total price
    document.getElementById("total-price").innerText = `N${totalAmount.toLocaleString()}`;

    // Display the invoice
    document.getElementById("invoice-container").classList.remove("hidden");
}

// Event listener for cart icon
document.getElementById('cart-icon-container').addEventListener('click', () => {
    generateInvoice(); // Generate the invoice when cart is clicked
});

// Event listener to print the invoice
document.getElementById('print-button').addEventListener('click', () => {
    window.print(); // Print the invoice when the print button is clicked
});

// Event listener to close the invoice
document.getElementById('close-invoice').addEventListener('click', () => {
    document.getElementById('invoice-container').classList.add('hidden'); // Close the invoice modal
});
