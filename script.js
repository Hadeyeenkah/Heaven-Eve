// Smooth scrolling for anchor links
(function handleSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetHref = this.getAttribute('href');
            const targetSection = document.querySelector(targetHref);

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }

            if (targetHref === '#openModal') {
                openModal('serviceModal');
            }
        });
    });

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal with ID "${modalId}" not found.`);
            return;
        }

        if (!modal.dataset.initialized) {
            initializeModal(modal);
            modal.dataset.initialized = true;
        }

        modal.style.display = "block";
    }

    function initializeModal(modal) {
        const closeButton = modal.querySelector(".close");
        if (!closeButton) {
            console.error("Close button not found inside modal.");
            return;
        }

        closeButton.addEventListener('click', () => closeModal(modal));
        window.addEventListener('click', (event) => {
            if (event.target === modal) closeModal(modal);
        });
    }

    function closeModal(modal) {
        modal.style.display = "none";
    }
})();

// Tab switching functionality
(function handleTabSwitching() {
    document.addEventListener("DOMContentLoaded", () => {
        const tabs = document.querySelectorAll(".tab-btn");
        const panels = document.querySelectorAll(".tab-panel");

        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                tabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");

                panels.forEach(panel => panel.classList.add("hidden"));
                const target = tab.getAttribute("data-tab");
                const targetPanel = document.getElementById(target);
                if (targetPanel) {
                    targetPanel.classList.remove("hidden");
                }
            });
        });
    });
})();

// Sidebar toggle functionality
(function handleSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebar = document.getElementById('close-sidebar');
    const body = document.body;

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.style.left = '0';
            body.classList.add('sidebar-active');
        });
    }

    if (closeSidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar.style.left = '-250px';
            body.classList.remove('sidebar-active');
        });
    }
})();

// Shopping cart functionality
(function handleShoppingCart() {
    let cart = [];
    let totalPrice = 0;

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function () {
            const itemElement = this.closest('.item');
            const itemName = itemElement.querySelector('h3').textContent;
            const itemPrice = parseFloat(itemElement.querySelector('.price').getAttribute('data-price'));
            const quantity = parseInt(itemElement.querySelector('.quantity').value);

            if (quantity < 1) {
                alert("Please enter a valid quantity.");
                return;
            }

            const existingItem = cart.find(item => item.name === itemName);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({ name: itemName, price: itemPrice, quantity });
            }

            totalPrice += itemPrice * quantity;
            updateCart();
        });
    });

    function updateCart() {
        const cartItemsList = document.getElementById('cart-items');
        cartItemsList.innerHTML = '';
        cart.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;
            cartItemsList.appendChild(listItem);
        });
        document.getElementById('total-price').textContent = `Total: $${totalPrice.toFixed(2)}`;
    }

    document.getElementById('confirm-order')?.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty! Please add some items before confirming.');
            return;
        }

        let orderDetails = 'Order Confirmed:\n\n';
        cart.forEach(item => {
            orderDetails += `${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
        });
        orderDetails += `\nTotal: $${totalPrice.toFixed(2)}`;

        alert(orderDetails);

        cart = [];
        totalPrice = 0;
        updateCart();
    });
})();

// Subscription and login functionality
(function handleSubscriptionForm() {
    const form = document.getElementById("subscription-form");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;

        try {
            const response = await fetch("/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email }),
            });

            if (response.ok) {
                alert("Subscription successful!");
                localStorage.setItem("isSubscribed", "true");
                window.location.href = "dashboard.html";
            } else {
                const data = await response.json();
                alert(data.message || "Subscription failed. Please try again.");
            }
        } catch (error) {
            alert("An error occurred. Please try again later.");
        }
    });
})();

// Navbar toggle functionality
(function handleNavbarToggle() {
    const menuToggle = document.getElementById('menu-toggle');
    if (!menuToggle) return;

    menuToggle.addEventListener('click', function () {
        const navbarLinks = document.querySelector('.navbar-links');
        navbarLinks.classList.toggle('active');
    });
})();

// Login and menu access check
document.addEventListener("DOMContentLoaded", function () {
    const orderMenuBtn = document.getElementById("order-menu-btn");
    const loginModal = document.getElementById("loginModal");
    const closeLoginModal = document.getElementById("closeLoginModal");
    const loginForm = document.getElementById("login-form");

    // Simulate a logged-in user (Replace this with real authentication)
    let isLoggedIn = localStorage.getItem("loggedIn") === "true";

    // Check login status when clicking "Order Menu"
    orderMenuBtn.addEventListener("click", function (event) {
        if (!isLoggedIn) {
            event.preventDefault(); // Prevent navigation
            loginModal.classList.add("active"); // Show modal
        } else {
            window.location.href = "menu.html"; // Allow access if logged in
        }
    });

    // Handle login form submission
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        isLoggedIn = true;
        localStorage.setItem("loggedIn", "true"); // Save login status
        loginModal.classList.remove("active"); // Hide modal
        window.location.href = "menu.html"; // Redirect to menu
    });

    // Close modal when clicking the close button
    closeLoginModal.addEventListener("click", function () {
        loginModal.classList.remove("active");
    });
});
