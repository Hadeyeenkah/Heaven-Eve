// ----------------------------------------
// DOM Elements
// ----------------------------------------
const cartIcon = document.querySelector('.cart-icon');
const cartPopup = document.querySelector('.cart-popup');
const cartItemsList = document.querySelector('.cart-items-list');
const cartCount = document.querySelector('.cart-count');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutInfo = document.querySelector('.cart-checkout-info');
const proceedButton = document.getElementById('checkout-btn');
const checkoutFormContainer = document.querySelector('.cart-checkout-form-container');
const checkoutFormElement = document.getElementById('checkout-form');
const menuItems = document.querySelector('.menu-items'); // Container holding all menu items

// ----------------------------------------
// Cart Data
// ----------------------------------------
let cart = [];

// ----------------------------------------
// Helper Functions
// ----------------------------------------
// Format price to Naira
const formatToNaira = (amount) => `₦${Number(amount).toLocaleString('en-NG')}`;

// Toggle Cart Popup
cartIcon.addEventListener('click', () => {
    cartPopup.style.display = cartPopup.style.display === 'block' ? 'none' : 'block';
});

// Add Item to Cart
function addItemToCart(item) {
    const name = item.querySelector('h3').textContent;
    const sizeSelect = item.querySelector('.size-select');
    let size = 'Default'; // Fallback if size selection is not required or not available
    
    if (sizeSelect) {
        size = sizeSelect.value;
        if (size === "") {
            alert("Please select a size before adding to cart.");
            return;
        }
    }

    const smallPrice = parseFloat(item.querySelector('.price').dataset.smallPrice);
    const bigPrice = parseFloat(item.querySelector('.price').dataset.bigPrice);

    const selectedSize = sizeSelect ? sizeSelect.value : 'small'; // Default to 'small' if no size selection
    const price = selectedSize === 'small' ? smallPrice : bigPrice;

    if (isNaN(price)) {
        console.error('Invalid price detected');
        return;
    }

    const existingItemIndex = cart.findIndex(
        (cartItem) => cartItem.name === name && cartItem.size === selectedSize
    );

    if (existingItemIndex >= 0) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({ name, size: selectedSize, price, quantity: 1 });
    }

    updateCart();
}

// Add event listener to all "Add to Cart" buttons using event delegation
function setUpAddToCartListeners() {
    menuItems.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('add-to-cart')) {
            const menuItem = e.target.closest('.menu-item');
            if (menuItem) {
                addItemToCart(menuItem);
            }
        }
    });
}

// Update Cart
function updateCart() {
    // Update Cart Count
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update Cart Items List
    cartItemsList.innerHTML = cart
        .map((item, index) => `
            <div class="cart-item" data-index="${index}">
                <span>${item.name} (${item.size}) x${item.quantity}</span>
                <span>${formatToNaira(item.price * item.quantity)}</span>
                <button class="remove-item" data-index="${index}">Remove</button>
            </div>
        `)
        .join('');

    // Attach event listeners to remove buttons
    document.querySelectorAll('.remove-item').forEach((button) =>
        button.addEventListener('click', (e) => {
            const itemIndex = parseInt(e.target.dataset.index, 10);
            removeItemFromCart(itemIndex);
        })
    );

    // Update Total Price
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    cartTotalPrice.textContent = formatToNaira(totalPrice);

    // Toggle Checkout Info
    checkoutInfo.style.display = cart.length > 0 ? 'block' : 'none';
}

// Remove Item from Cart
function removeItemFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// ----------------------------------------
// Checkout Process
// ----------------------------------------

// Proceed to Checkout
proceedButton.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty. Add items to proceed.');
        return;
    }

    // Hide Cart Items and Show Checkout Form
    document.querySelector('.cart-items-container').style.display = 'none';

    // Display the Checkout Form with a sliding effect
    checkoutFormContainer.style.display = 'block';
    setTimeout(() => checkoutFormContainer.classList.add('slide-in'), 10);
});

// Handle Checkout Form Submission
checkoutFormElement.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(checkoutFormElement);
    const orderDetails = Object.fromEntries(formData.entries());
    orderDetails.cartItems = cart;

    console.log('Order Details:', orderDetails);

    // Send Order Data to Admin (can be done through an API)
    fetch('/send-order-to-admin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDetails),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.success) {
            alert('Order placed successfully!');
            cart = [];
            updateCart();
            checkoutFormElement.reset();
            cartPopup.style.display = 'none';
        } else {
            alert('Failed to place order. Please try again.');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred while placing the order.');
    });
});

// ----------------------------------------
// Category Filtering
// ----------------------------------------

// Filter by Category
document.querySelectorAll('.category-button').forEach((button) => {
    button.addEventListener('click', () => {
        const category = button.getAttribute('data-category');
        document.querySelectorAll('.menu-item').forEach((item) => {
            item.style.display = category === 'all' || item.dataset.category === category ? 'block' : 'none';
        });
    });
});

// ----------------------------------------
// Payment Integration
// ----------------------------------------

// Paystack Payment Integration
proceedButton.addEventListener('click', function () {
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0) * 100; // Amount in kobo

    if (totalPrice <= 0) {
        alert('Your cart is empty. Add items to proceed.');
        return;
    }

    // Replace with actual user details
    const user = {
        email: 'jzjz476@gmail.com', // Replace with dynamic user email
        name: 'John Doe', // Replace with dynamic user name
        phone: '08012345678' // Replace with dynamic user phone
    };
    

    const handler = PaystackPop.setup({
        key: 'pk_test_ba57a8dabea037745d687a13a2d4846f4e1ac3d9', // Replace with your Paystack public key
        email: user.email,
        amount: totalPrice,
        currency: 'NGN',
        ref: `PSK_${Math.floor(Math.random() * 1000000000)}`, // Unique transaction reference
        metadata: {
            customerName: user.name,
            customerPhone: user.phone,
            orderItems: cart.map(item => `${item.name} (x${item.quantity})`),
            totalAmount: totalPrice
        },
        callback: function (response) {
            alert(`✅ Payment successful! Transaction reference: ${response.reference}`);
            
            // Send order details to the backend for processing
            fetch('/api/process-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    orderItems: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
                    totalAmount: totalPrice,
                    paymentRef: response.reference
                })
            })
            .then(res => res.json())
            .then(data => {
                console.log('📩 Order processed successfully:', data);
            })
            .catch(error => console.error('❌ Order processing error:', error));

            // Clear cart
            cart = [];
            updateCart();
        },
        onClose: function () {
            alert('⚠️ Payment process cancelled.');
        },
    });

    handler.openIframe();
});


// ----------------------------------------
// Size Selection Price Update
// ----------------------------------------

document.querySelectorAll('.size-select').forEach((select) => {
    select.addEventListener('change', function () {
        const menuItem = this.closest('.menu-item');
        const priceElement = menuItem.querySelector('.price');
        const smallPrice = parseFloat(priceElement.dataset.smallPrice);
        const bigPrice = parseFloat(priceElement.dataset.bigPrice);

        const price = this.value === 'small' ? smallPrice : bigPrice;
        priceElement.textContent = formatToNaira(price);
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const proceedButton = document.getElementById('checkout-btn');
    const checkoutForm = document.getElementById('checkout-form');
    let cart = [
        { name: "Pizza", size: "Large", price: 5000, quantity: 2 },
        { name: "Burger", size: "Medium", price: 2500, quantity: 1 }
    ]; // Sample cart data

    // Proceed to checkout - Show form
    proceedButton.addEventListener('click', () => {
        document.querySelector('.cart-checkout-form-container').style.display = 'block';
    });

    // Handle form submission
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(checkoutForm);
        const orderDetails = Object.fromEntries(formData.entries());
        orderDetails.cart = cart; // Attach cart items

        try {
            const response = await fetch('send_email.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderDetails),
            });

            const result = await response.text();
            alert(result); // Show success or error message
        } catch (error) {
            alert('Error sending order. Please try again.');
            console.error(error);
        }
    });
});

// Initialize the Add to Cart event listeners initially
setUpAddToCartListeners();
