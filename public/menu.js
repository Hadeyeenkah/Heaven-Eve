// DOM Elements
const cartIcon = document.querySelector('.cart-icon');
const cartPopup = document.querySelector('.cart-popup');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const cartItemsList = document.querySelector('.cart-items-list');
const cartCount = document.querySelector('.cart-count');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutInfo = document.querySelector('.cart-checkout-info');
const proceedButton = document.getElementById('checkout-btn');
const checkoutFormContainer = document.querySelector('.cart-checkout-form-container');
const checkoutFormElement = document.getElementById('checkout-form');

const proceedToPaymentButton = document.getElementById('proceed-to-payment');
const billingForm = document.querySelector('.billing-info-container');
const paymentForm = document.querySelector('.payment-info-container');




// Cart Data
let cart = [];

// Format price to Naira
const formatToNaira = (amount) => `₦${Number(amount).toLocaleString('en-NG')}`;

// Toggle Cart Popup
cartIcon.addEventListener('click', () => {
    cartPopup.style.display = cartPopup.style.display === 'block' ? 'none' : 'block';
});

// Add Item to Cart
addToCartButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
        const item = e.target.closest('.menu-item');
        const name = item.querySelector('h3').textContent;
        const priceElement = item.querySelector('.price');
        const price = parseFloat(priceElement.textContent.replace(/[₦,]/g, ''));

        // Check if item already exists in cart
        const existingItem = cart.find((cartItem) => cartItem.name === name);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1 });
        }

        updateCart();
    });
});

// Update Cart
function updateCart() {
    // Update Cart Count
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update Cart Items List
    cartItemsList.innerHTML = cart
        .map(
            (item, index) => `
        <div class="cart-item" data-index="${index}">
            <span>${item.name} x${item.quantity}</span>
            <span>${formatToNaira(item.price * item.quantity)}</span>
            <button class="remove-item" data-index="${index}">Remove</button>
        </div>
    `
        )
        .join('');

    // Add event listeners to remove buttons
    const removeButtons = document.querySelectorAll('.remove-item');
    removeButtons.forEach((button) =>
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

// Proceed to Checkout (Show Checkout Form)
proceedButton.addEventListener('click', () => {
    // Hide the cart items and show the checkout form
    const cartItemsContainer = document.querySelector('.cart-items-container');
    cartItemsContainer.style.display = 'none'; // Hide cart items

    // Slide in the checkout form
    checkoutFormContainer.style.display = 'block';
    setTimeout(() => {
        checkoutFormContainer.classList.add('slide-in');
    }, 10); // Ensures the slide-in class is added after display
});


// Handle Form Submission
checkoutFormElement.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(checkoutFormElement);
    const orderDetails = Object.fromEntries(formData.entries());

    console.log('Order Details:', orderDetails);

    // Clear cart after order submission
    cart = [];
    updateCart();
    checkoutFormElement.reset();

    alert('Order placed successfully!');
    cartPopup.style.display = 'none';
});

// Update Price on Size Selection
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.size-select').forEach(select => {
        select.addEventListener('change', function () {
            const menuItem = this.closest('.menu-item');
            const priceElement = menuItem.querySelector('.price');
            const smallPrice = parseFloat(priceElement.dataset.smallPrice);
            const bigPrice = parseFloat(priceElement.dataset.bigPrice);

            if (this.value === 'small') {
                priceElement.textContent = formatToNaira(smallPrice);
            } else if (this.value === 'big') {
                priceElement.textContent = formatToNaira(bigPrice);
            }
        });
    });
});

// Filter by Category
const categoryButtons = document.querySelectorAll('.category-button');
const menuItems = document.querySelectorAll('.menu-item');

categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const category = button.getAttribute('data-category');

        categoryButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');

        menuItems.forEach((item) => {
            if (category === 'all' || item.getAttribute('data-category') === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// Add Slide-In Animation Styles
const style = document.createElement('style');
style.innerHTML = `
    .slide-in {
        animation: slideIn 0.5s ease-out forwards;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .cart-checkout-form-container {
        display: none; /* Initially hidden */
    }

    .cart-items-container {
        display: block; /* Ensure cart items are visible initially */
    }
`;
document.head.appendChild(style);
// Add debugging logs to trace execution
console.log("Script loaded");

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");

    // Select elements
    const cartIcon = document.querySelector(".cart-icon");
    const cartPopup = document.querySelector(".cart-popup");
    const checkoutBtn = document.getElementById("checkout-btn");
    const checkoutFormContainer = document.querySelector(".cart-checkout-form-container");

    if (!cartIcon || !cartPopup || !checkoutBtn || !checkoutFormContainer) {
        console.error("One or more required elements are missing.");
        return;
    }

    // Toggle cart popup
    cartIcon.addEventListener("click", () => {
        cartPopup.classList.toggle("visible");
        console.log("Cart icon clicked");
    });

    // Proceed to Checkout button
    checkoutBtn.addEventListener("click", () => {
        console.log("Proceed to checkout clicked");
        cartPopup.querySelector(".cart-items-container").style.display = "none";
        checkoutFormContainer.style.display = "block";

        // Add slide-in animation
        checkoutFormContainer.classList.add("slide-in");
    });

    // Add animations dynamically
    const style = document.createElement("style");
    style.innerHTML = `
        .slide-in {
            animation: slideIn 0.5s ease-out forwards;
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        .cart-checkout-form-container {
            display: none; /* Initially hidden */
        }
    `;
    document.head.appendChild(style);
    console.log("Animations added to head");
});
// Select the elements
const checkoutButton = document.getElementById('checkout-btn');
const checkoutForm = document.querySelector('.cart-checkout-form');

// Event listener for Proceed to Checkout button
checkoutButton.addEventListener('click', () => {
    // Slide the checkout form in smoothly
    checkoutForm.classList.remove('hidden');
    checkoutForm.style.display = 'block';
    checkoutForm.style.animation = 'slideIn 0.5s ease-out forwards';
});

// Optional: Animation for sliding in the checkout form
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
    @keyframes slideIn {
        from {
            transform: translateY(-20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`, styleSheet.cssRules.length);


