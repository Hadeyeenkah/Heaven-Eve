// Get references to the elements
const switchToLoginLink = document.getElementById('switch-to-login');
const signupForm = document.getElementById('signup-form');

// Toggle to Login Form
switchToLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert("Redirecting to login page...");
    window.location.href = "login.html";  // Redirect to login page
});

// Form Submission Handling
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const password = document.getElementById('password').value;

    console.log('Signup attempt:', { name, phone, email, address, password });
    alert('Signup successful! Welcome, ' + name);
});
