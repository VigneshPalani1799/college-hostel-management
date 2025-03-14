// Student login validation (for login.html)
document.getElementById("login-form")?.addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "student" && password === "student123") {
        // Redirect to the hostel info page if credentials are correct
        window.location.href = "hostel-info.html";
    } else {
        alert("Invalid username or password!");
    }
});

// Faculty login validation (for faculty-login.html)
document.getElementById("faculty-login-form")?.addEventListener("submit", function(e) {
    e.preventDefault();

    const facultyUsername = document.getElementById("faculty-username").value;
    const facultyPassword = document.getElementById("faculty-password").value;

    // Simple validation for faculty (you can modify this with real credentials)
    if (facultyUsername === "faculty" && facultyPassword === "faculty123") {
        // Redirect to the warden details page if credentials are correct
        window.location.href = "warden-details.html";
    } else {
        alert("Invalid username or password!");
    }
});

function showForm(role) {
    // Hide both forms first
    document.getElementById("student-form").classList.remove("active");
    document.getElementById("faculty-form").classList.remove("active");
    
    // Show the selected form
    if (role === 'student') {
        document.getElementById("student-form").classList.add("active");
    } else if (role === 'faculty') {
        document.getElementById("faculty-form").classList.add("active");
    }
}

// Simulate login data and display faculty name
const facultyName = "Dr. John Doe"; // This would come from the backend after authentication
document.getElementById('faculty-name').textContent = `Welcome, ${facultyName}`;