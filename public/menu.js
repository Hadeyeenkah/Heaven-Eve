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
const menuItemsContainer = document.getElementById('menu-items-container');

// ----------------------------------------
// Cart Data
// ----------------------------------------
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ----------------------------------------
// Bank Details Configuration
// ----------------------------------------
const BANK_DETAILS = {
    bankName: "GTBank",
    accountName: "Heaven & Eve Cafe",
    accountNumber: "0123456789"
};

// ----------------------------------------
// Load Menu Items from Admin
// ----------------------------------------
function loadMenuItems() {
    const adminMenuItems = JSON.parse(localStorage.getItem('adminMenuItems')) || [];
    
    // Default menu items if admin hasn't added any
    const defaultMenuItems = [
        {
            id: 1,
            name: 'Espresso',
            category: 'starters',
            description: 'Rich and bold espresso shot',
            smallPrice: 3500,
            bigPrice: 4500,
            image: 'images/starter1.jpg'
        },
    ];
    
    // Combine admin items with default items
    const allMenuItems = [...adminMenuItems, ...defaultMenuItems];
    
    renderMenuItems(allMenuItems);
    return allMenuItems;
}

// ----------------------------------------
// Render Menu Items
// ----------------------------------------
function renderMenuItems(items) {
    menuItemsContainer.innerHTML = items.map(item => `
        <article class="menu-item" data-category="${item.category}">
            <img src="${item.image}" alt="${item.name}">
            <div class="menu-item-content">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p class="price" data-small-price="${item.smallPrice}" data-big-price="${item.bigPrice || item.smallPrice}">
                    ₦${item.smallPrice.toLocaleString()}
                </p>
                ${item.bigPrice ? `
                    <div class="size-selection">
                        <label>Choose Size:</label>
                        <select class="size-select">
                            <option value="small">Small - ₦${item.smallPrice.toLocaleString()}</option>
                            <option value="big">Big - ₦${item.bigPrice.toLocaleString()}</option>
                        </select>
                    </div>
                ` : ''}
                <button class="add-to-cart">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </article>
    `).join('');
    
    // Re-attach event listeners for size selection
    attachSizeListeners();
}

// ----------------------------------------
// Helper Functions
// ----------------------------------------
// Format price to Naira
const formatToNaira = (amount) => `₦${Number(amount).toLocaleString('en-NG')}`;

// Save Cart to localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Toggle Cart Popup
cartIcon.addEventListener('click', () => {
    cartPopup.classList.toggle('show');
});

document.querySelector('.close-cart').addEventListener('click', () => {
    cartPopup.classList.remove('show');
});

// Add Item to Cart
function addItemToCart(item) {
    const name = item.querySelector('h3').textContent;
    const sizeSelect = item.querySelector('.size-select');
    let size = 'Default';
    
    if (sizeSelect) {
        size = sizeSelect.value;
        if (size === "") {
            alert("Please select a size before adding to cart.");
            return;
        }
    }

    const smallPrice = parseFloat(item.querySelector('.price').dataset.smallPrice);
    const bigPrice = parseFloat(item.querySelector('.price').dataset.bigPrice);

    const selectedSize = sizeSelect ? sizeSelect.value : 'small';
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
    
    saveCartToLocalStorage();
    updateCart();
    
    // Show success message
    showNotification('Item added to cart!');
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Event delegation for Add to Cart buttons
menuItemsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart') || e.target.parentElement.classList.contains('add-to-cart')) {
        const button = e.target.classList.contains('add-to-cart') ? e.target : e.target.parentElement;
        const menuItem = button.closest('.menu-item');
        if (menuItem) {
            addItemToCart(menuItem);
        }
    }
});

// Update Cart
function updateCart() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;

    cartItemsList.innerHTML = cart
        .map((item, index) => `
            <div class="cart-item" data-index="${index}">
                <div>
                    <strong>${item.name}</strong> (${item.size})
                    <br>
                    <span>x${item.quantity} - ${formatToNaira(item.price * item.quantity)}</span>
                </div>
                <button class="remove-item" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `)
        .join('');

    document.querySelectorAll('.remove-item').forEach((button) =>
        button.addEventListener('click', (e) => {
            const itemIndex = parseInt(e.target.closest('.remove-item').dataset.index, 10);
            removeItemFromCart(itemIndex);
        })
    );

    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    cartTotalPrice.textContent = formatToNaira(totalPrice);

    checkoutInfo.style.display = cart.length > 0 ? 'block' : 'none';
}

// Remove Item from Cart
function removeItemFromCart(index) {
    cart.splice(index, 1);
    saveCartToLocalStorage();
    updateCart();
}

// ----------------------------------------
// Checkout Process
// ----------------------------------------
proceedButton.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty. Add items to proceed.');
        return;
    }

    document.querySelector('.cart-popup-body').style.display = 'none';
    checkoutFormContainer.classList.add('show');
});

// Handle Checkout Form Submission
checkoutFormElement.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(checkoutFormElement);
    const orderDetails = {
        id: Date.now(),
        customerName: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        items: cart,
        total: cart.reduce((total, item) => total + item.price * item.quantity, 0),
        status: 'pending-payment',
        date: new Date().toISOString()
    };

    // Save order to localStorage
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(orderDetails);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Show bank details and order tracking
    showBankDetailsAndTracking(orderDetails.id, orderDetails.total);

    // Clear cart
    cart = [];
    saveCartToLocalStorage();
    updateCart();
    checkoutFormElement.reset();
    cartPopup.classList.remove('show');
    checkoutFormContainer.classList.remove('show');
    document.querySelector('.cart-popup-body').style.display = 'block';
});

// ----------------------------------------
// Bank Details and Order Tracking
// ----------------------------------------
function showBankDetailsAndTracking(orderId, totalAmount) {
    const trackingModal = document.querySelector('.tracking-modal');
    const modalContent = trackingModal.querySelector('.tracking-modal-content');
    
    // Create bank details section
    const bankDetailsHTML = `
        <div class="bank-details-section" style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #4b2e2a;">
            <h3 style="color: #4b2e2a; margin-bottom: 15px; text-align: center;">
                <i class="fas fa-university"></i> Payment Details
            </h3>
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <p style="margin: 10px 0; font-size: 1.1rem;"><strong>Bank Name:</strong> ${BANK_DETAILS.bankName}</p>
                <p style="margin: 10px 0; font-size: 1.1rem;"><strong>Account Name:</strong> ${BANK_DETAILS.accountName}</p>
                <p style="margin: 10px 0; font-size: 1.3rem; color: #4b2e2a;"><strong>Account Number:</strong> ${BANK_DETAILS.accountNumber}</p>
                <p style="margin: 15px 0; font-size: 1.2rem; color: #28a745; font-weight: bold;">
                    <strong>Amount to Pay:</strong> ${formatToNaira(totalAmount)}
                </p>
            </div>
            <div style="background: #fff3cd; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <p style="margin: 0; color: #856404; font-size: 0.95rem;">
                    <i class="fas fa-info-circle"></i> Please make the transfer and wait for confirmation. 
                    Your order will be processed once payment is verified.
                </p>
            </div>
        </div>
    `;
    
    // Insert bank details before tracking steps
    const existingBankDetails = modalContent.querySelector('.bank-details-section');
    if (existingBankDetails) {
        existingBankDetails.remove();
    }
    
    const trackingSteps = modalContent.querySelector('.tracking-steps');
    trackingSteps.insertAdjacentHTML('beforebegin', bankDetailsHTML);
    
    // Update order ID display
    document.getElementById('order-id-display').textContent = orderId;
    
    // Update tracking steps
    updateTrackingDisplay('pending-payment');
    
    trackingModal.classList.add('show');
    
    // Start checking for order status updates
    startOrderStatusMonitoring(orderId);
}

function updateTrackingDisplay(status) {
    const steps = document.querySelectorAll('.tracking-step');
    const statusOrder = ['pending-payment', 'payment-received', 'preparing', 'ready', 'delivery'];
    const currentIndex = statusOrder.indexOf(status);
    
    steps.forEach((step, index) => {
        const stepStatus = step.dataset.status;
        const stepIndex = statusOrder.indexOf(stepStatus);
        
        step.classList.remove('active', 'completed');
        
        if (stepIndex < currentIndex) {
            step.classList.add('completed');
        } else if (stepIndex === currentIndex) {
            step.classList.add('active');
        }
    });
}

function startOrderStatusMonitoring(orderId) {
    // Check order status every 3 seconds
    const checkInterval = setInterval(() => {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const order = orders.find(o => o.id === orderId);
        
        if (order) {
            updateTrackingDisplay(order.status);
            
            // Stop monitoring if order is completed or delivery
            if (order.status === 'delivery') {
                clearInterval(checkInterval);
                
                // Show completion message after 5 seconds
                setTimeout(() => {
                    showNotification('Order delivered! Thank you for your purchase.');
                }, 5000);
            }
        } else {
            clearInterval(checkInterval);
        }
    }, 3000);
    
    // Store interval ID for cleanup if needed
    window.currentOrderMonitoring = checkInterval;
}

document.querySelector('.close-tracking').addEventListener('click', () => {
    document.querySelector('.tracking-modal').classList.remove('show');
    // Don't clear the monitoring interval - let it continue in background
});

// ----------------------------------------
// Category Filtering
// ----------------------------------------
document.querySelectorAll('.category-button').forEach((button) => {
    button.addEventListener('click', () => {
        // Update active button
        document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const category = button.getAttribute('data-category');
        document.querySelectorAll('.menu-item').forEach((item) => {
            item.style.display = category === 'all' || item.dataset.category === category ? 'block' : 'none';
        });
    });
});

// ----------------------------------------
// Size Selection Price Update
// ----------------------------------------
function attachSizeListeners() {
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
}

// ----------------------------------------
// Initialize
// ----------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    loadMenuItems();
    updateCart();
    
    // Add tracking steps to modal if they don't exist
    const trackingSteps = document.querySelector('.tracking-steps');
    if (trackingSteps && !trackingSteps.querySelector('[data-status="pending-payment"]')) {
        // Update tracking steps HTML to include all statuses
        trackingSteps.innerHTML = `
            <div class="tracking-step" data-status="pending-payment">
                <div class="step-icon"><i class="fas fa-clock"></i></div>
                <div class="step-info">
                    <h4>Pending Payment</h4>
                    <p>Waiting for payment confirmation</p>
                </div>
            </div>
            <div class="tracking-step" data-status="payment-received">
                <div class="step-icon"><i class="fas fa-check-circle"></i></div>
                <div class="step-info">
                    <h4>Payment Received</h4>
                    <p>Payment confirmed by admin</p>
                </div>
            </div>
            <div class="tracking-step" data-status="preparing">
                <div class="step-icon"><i class="fas fa-utensils"></i></div>
                <div class="step-info">
                    <h4>Preparing</h4>
                    <p>Your order is being prepared</p>
                </div>
            </div>
            <div class="tracking-step" data-status="ready">
                <div class="step-icon"><i class="fas fa-check"></i></div>
                <div class="step-info">
                    <h4>Ready</h4>
                    <p>Order is ready for pickup/delivery</p>
                </div>
            </div>
            <div class="tracking-step" data-status="delivery">
                <div class="step-icon"><i class="fas fa-truck"></i></div>
                <div class="step-info">
                    <h4>Out for Delivery</h4>
                    <p>Your order is on the way</p>
                </div>
            </div>
        `;
    }
});