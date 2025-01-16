// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetHref = this.getAttribute('href');
        const targetSection = document.querySelector(targetHref);

        // Smooth scrolling to the target section
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth'
            });
        }

        // Open modal if the clicked link is meant to trigger one
        if (targetHref === '#openModal') {
            openModal('serviceModal');
        }
    });
});

// Function to open a modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal with ID "${modalId}" not found.`);
        return;
    }

    const closeButton = modal.querySelector(".close");
    if (!closeButton) {
        console.error(`Close button not found inside modal with ID "${modalId}".`);
        return;
    }

    // Initialize modal once
    if (!modal.dataset.initialized) {
        // Close modal when close button is clicked
        closeButton.addEventListener('click', () => closeModal(modal));

        // Close modal when clicking outside of it
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });

        // Mark modal as initialized
        modal.dataset.initialized = true;
    }

    // Show the modal
    modal.style.display = "block";
}

// Function to close a modal
function closeModal(modal) {
    modal.style.display = "none";
}

// Tab switching functionality
document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".tab-btn");
    const panels = document.querySelectorAll(".tab-panel");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove("active"));
            // Add active class to the clicked tab
            tab.classList.add("active");

            // Hide all panels
            panels.forEach(panel => panel.classList.add("hidden"));

            // Show the corresponding panel
            const target = tab.getAttribute("data-tab");
            const targetPanel = document.getElementById(target);
            if (targetPanel) {
                targetPanel.classList.remove("hidden");
            }
        });
    });

    // Initialize cart count
    let cartCount = 0;

    // Function to add items to the cart
    function addToCart(itemName, price, quantityId) {
        // Get the quantity of the selected item
        const quantity = parseInt(document.getElementById(quantityId).value);

        // Update the cart count
        cartCount += quantity;

        // Update the cart icon and count
        document.getElementById('cartCount').innerText = cartCount;

        // Optionally, you can display a confirmation message
        alert(`${quantity} x ${itemName} added to cart. Total: #${price * quantity}`);
    }

   // Subscription form handling
document.getElementById("subscription-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const payment = document.getElementById("payment").value; // You can use a payment gateway here (Stripe)

    const response = await fetch("/subscribe", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, payment }),
    });

    const data = await response.json();

    if (response.ok) {
        alert("Subscription successful! You now have access.");
        localStorage.setItem("isSubscribed", "true"); // Set subscription status in localStorage
        window.location.href = "dashboard.html"; // Redirect to dashboard
    } else {
        alert(data.message || "Subscription failed. Please try again.");
    }

    // Clear input fields after submission
    document.getElementById("username").value = '';
    document.getElementById("email").value = '';
    document.getElementById("payment").value = '';
});

// Subscription and login management
const subscriptionModal = document.getElementById('subscriptionModal');
const protectedLinks = document.querySelectorAll('.protected-link');
const user = { isSubscribed: localStorage.getItem("isSubscribed") === "true" }; // Simulate user subscription status

// Add click event to all protected links
protectedLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent the default link behavior

        // Check if user is subscribed and logged in
        if (!user.isSubscribed) {
            // Show the subscription modal if not subscribed
            subscriptionModal.style.display = "block";
        } else if (!localStorage.getItem("isLoggedIn")) {
            // Show the login modal if the user is not logged in
            openModal('login-modal');
        } else {
            // Allow access to the page if user is subscribed and logged in
            window.location.href = link.href;
        }
    });
});

// Close the modal if the user clicks the 'X' button
document.getElementById('closeModal').addEventListener('click', () => {
    subscriptionModal.style.display = "none";
});

// Close modal if clicked outside the content
window.addEventListener('click', (event) => {
    if (event.target === subscriptionModal) {
        subscriptionModal.style.display = "none";
    }
});

// If the user clicks 'Go to Subscription', redirect to the subscription page
document.getElementById('subscribeButton').addEventListener('click', () => {
    window.location.href = '/subscribe'; // Redirect to the subscription page
});

// If the user clicks 'Cancel', close the modal
document.getElementById('cancelButton').addEventListener('click', () => {
    subscriptionModal.style.display = "none";
});

// Modal functionality to display subscription prompt on first visit
if (!localStorage.getItem("hasClicked")) {
    document.getElementById("subscribe-modal").style.display = "block";
}

// Subscription and login functions
function subscribe() {
    localStorage.setItem("isSubscribed", "true");
    localStorage.setItem("hasClicked", "true"); // Mark first click
    closeModal('subscribe-modal');
    document.getElementById("login-modal").style.display = "block";
}

function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    if (username && password) {
        localStorage.setItem("isLoggedIn", "true");
        alert("Login successful!");
        closeModal('login-modal');
        window.location.href = "dashboard.html"; // Redirect to the dashboard page
    } else {
        alert("Please enter valid login details.");
    }
}

// Open modals based on subscription and login status when page loads
window.onload = function () {
    if (localStorage.getItem("isSubscribed") === "true") {
        if (localStorage.getItem("isLoggedIn") !== "true") {
            document.getElementById("login-modal").style.display = "block";
        }
    } else {
        if (!localStorage.getItem("hasClicked")) {
            document.getElementById("subscribe-modal").style.display = "block";
        }
    }
}

// Helper function to open modals
function openModal(modalId) {
    document.getElementById(modalId).style.display = "block";
}

// Helper function to close modals
function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
});
// Initializing an empty cart and total price
let cart = [];
let totalPrice = 0;

// Selecting all 'Add to Cart' buttons
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
        // Get the item details from the button's associated elements
        const itemElement = this.parentElement; // Get the parent of the button (menu-item)
        const itemName = itemElement.querySelector('h3').textContent; // Get item name
        const itemPrice = parseFloat(itemElement.querySelector('.price').getAttribute('data-price')); // Get item price
        const quantity = parseInt(itemElement.querySelector('.quantity').value); // Get quantity from input

        // Validate quantity (make sure it's a positive number)
        if (quantity < 1) {
            alert("Please enter a valid quantity.");
            return;
        }

        // Check if item already exists in cart
        const existingItem = cart.find(item => item.name === itemName);
        if (existingItem) {
            // Update the quantity if the item already exists
            existingItem.quantity += quantity;
        } else {
            // Add new item to the cart
            cart.push({ name: itemName, price: itemPrice, quantity: quantity });
        }

        // Update total price
        totalPrice += itemPrice * quantity;

        // Update the cart display
        updateCart();
    });
});

// Function to update the cart display
function updateCart() {
    const cartItemsList = document.getElementById('cart-items');
    cartItemsList.innerHTML = ''; // Clear the cart items list

    // Loop through the cart and display the items
    cart.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;
        cartItemsList.appendChild(listItem);
    });

    // Update the total price
    document.getElementById('total-price').textContent = `Total: $${totalPrice.toFixed(2)}`;
}

// Confirm order action
document.getElementById('confirm-order').addEventListener('click', function() {
    if (cart.length === 0) {
        alert('Your cart is empty! Please add some items before confirming.');
        return;
    }

    // Show order details when the user confirms
    let orderDetails = 'Order Confirmed:\n\n';
    cart.forEach(item => {
        orderDetails += `${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    orderDetails += `\nTotal: $${totalPrice.toFixed(2)}`;

    alert(orderDetails);

    // Clear the cart after confirmation
    cart = [];
    totalPrice = 0;
    updateCart(); // Reset cart display
});
