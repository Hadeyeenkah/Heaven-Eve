
    document.getElementById('orderMenuBtn').addEventListener('click', function(e) {
        // Check if user is logged in (you can use localStorage, sessionStorage, or cookies for authentication)
        let userIsLoggedIn = localStorage.getItem('userLoggedIn'); // Assuming you store login status in localStorage

        if (!userIsLoggedIn) {
            // If user isn't logged in, prevent default action and show the login modal or redirect
            e.preventDefault();
            window.location.href = 'login.html'; // Redirect to login page
        }
    });

