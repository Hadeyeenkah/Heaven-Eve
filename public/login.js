document.addEventListener("DOMContentLoaded", () => {
    // Ensure elements are fully loaded before execution
    initAuthForms();
});

function initAuthForms() {
    const switchToRegisterLink = document.getElementById("switch-to-register");
    const switchToLoginLink = document.getElementById("switch-to-login");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const formTitle = document.getElementById("form-title");

    if (!switchToRegisterLink || !switchToLoginLink || !loginForm || !registerForm || !formTitle) {
        console.error("One or more required elements are missing in the DOM.");
        return;
    }

    // Form switching logic
    switchToRegisterLink.addEventListener("click", (e) => {
        e.preventDefault();
        toggleForms(loginForm, registerForm);
        formTitle.textContent = "Register";
    });

    switchToLoginLink.addEventListener("click", (e) => {
        e.preventDefault();
        toggleForms(registerForm, loginForm);
        formTitle.textContent = "Login";
    });

    // Attach event listeners for form submissions
    setupFormListeners(loginForm, registerForm);
}

function setupFormListeners(loginForm, registerForm) {
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email")?.value.trim();
    const password = document.getElementById("login-password")?.value.trim();

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5502/api/client/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("authToken", data.token);
            window.location.href = "./menu.html";
        } else {
            throw new Error(data.message || "Login failed");
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("Login failed: Please try again later.");
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById("register-username")?.value.trim();
    const email = document.getElementById("register-email")?.value.trim();
    const password = document.getElementById("register-password")?.value.trim();

    if (!username || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5502/api/client/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            alert("Registration successful!");
            localStorage.setItem("authToken", data.token);
            window.location.href = "./menu.html";
        } else {
            throw new Error(data.message || "Registration failed");
        }
    } catch (error) {
        console.error("Registration Error:", error);
        alert("Registration failed: Please try again later.");
    }
}

/**
 * Toggle Forms Visibility
 */
function toggleForms(formToHide, formToShow) {
    if (formToHide && formToShow) {
        formToHide.classList.add("hidden");
        formToShow.classList.remove("hidden");
    } else {
        console.error("One or both form elements not found.");
    }
}
