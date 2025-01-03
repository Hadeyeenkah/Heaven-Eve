document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Smooth scrolling to the target section
        const targetSection = document.querySelector(this.getAttribute('href'));
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth'
            });
        }

        // Trigger modal if the clicked link opens a modal
        if (this.getAttribute('href') === '#openModal') {
            openModal('serviceModal');
        }
    });
});

// Function to open a modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const span = modal.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.addEventListener('click', () => closeModal(modal));

    // When the user clicks anywhere outside the modal, close it
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal(modal);
        }
    });

    // Show the modal
    modal.style.display = "block";
}

// Function to close a modal
function closeModal(modal) {
    modal.style.display = "none";
}
