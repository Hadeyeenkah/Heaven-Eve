// Track if the user is visiting for the first time
if (!localStorage.getItem("hasClicked")) {
    document.getElementById("subscribe-modal").style.display = "block";
}

// Close Modal Function
function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

// Subscription Function
function subscribe() {
    // Save subscription status and user click state in localStorage
    localStorage.setItem("isSubscribed", "true");
    localStorage.setItem("hasClicked", "true"); // Mark first click
    closeModal('subscribe-modal');
    document.getElementById("login-modal").style.display = "block";
}

// Login Function
function login() {
    var username = document.getElementById("login-username").value;
    var password = document.getElementById("login-password").value;

    // Simple validation for demonstration (replace with actual validation)
    if (username && password) {
        localStorage.setItem("isLoggedIn", "true");
        alert("Login successful!");
        closeModal('login-modal');
        window.location.href = "dashboard.html"; // Redirect to the dashboard page
    } else {
        alert("Please enter valid login details.");
    }
}

// On document load, check subscription and login status
window.onload = function() {
    if (localStorage.getItem("isSubscribed") === "true") {
        if (localStorage.getItem("isLoggedIn") !== "true") {
            document.getElementById("login-modal").style.display = "block";
        }
    } else {
        // Prompt the user to subscribe on first visit
        if (!localStorage.getItem("hasClicked")) {
            document.getElementById("subscribe-modal").style.display = "block";
        }
    }
};
