document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.nav-button');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            buttons.forEach(btn => btn.classList.remove('active'));
            // Add active class to the clicked button
            button.classList.add('active');

            // Handle redirection based on the data-section attribute
            const section = button.dataset.section;
            if (section) {
                redirectToSection(section);
            }
        });
    });
});

/**
 * Redirects to the specified section page in a new tab.
 * @param {string} section - The section identifier to redirect to.
 */
function redirectToSection(section) {
    const sectionPages = {
        "inventory": "inventory.html",
        "verification": "verification.html",
        "sales": "sales.html",
        "tracking": "tracking.html",
        "staff-training": "training.html",
        "newchatbot": "newchatbot.html",
        "feedback": "feedback.html",
        "help" : "help.html"
    };

    const pageUrl = sectionPages[section];
    if (pageUrl) {
        window.location.href = pageUrl;
    } else {
        console.error(`No page found for section: ${section}`);
    }
}

function logout() {
    // You can add the logout functionality here
    // For example, redirect to the login page or clear user session
    window.location.href = 'login.html'; // Example: redirecting to login page
}


