document.addEventListener("DOMContentLoaded", function() {
    function showForm(role) {
        document.querySelectorAll(".form-container").forEach(form => form.classList.remove("active"));
        document.getElementById(`${role}-form`).classList.add("active");
    }

    document.querySelector(".btn-group button:nth-child(1)").addEventListener("click", () => showForm('student'));
    document.querySelector(".btn-group button:nth-child(2)").addEventListener("click", () => showForm('faculty'));

    async function loginUser(event, form) {
        event.preventDefault();
        const email = form.email.value;
        const password = form.password.value;
    
        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // ✅ Store the JWT token in sessionStorage
                sessionStorage.setItem("authToken", data.token);
                sessionStorage.setItem("userRole", data.role);

                alert("Login successful! Redirecting...");

                // ✅ Redirect users based on role
                if (data.role === "faculty") {
                    window.location.href = "faculty_home.html";
                } else if (data.role === "student") {
                    window.location.href = "welcome.html";
                } else {
                    alert("Unknown user role! Please contact support.");
                }
            } else {
                alert("Invalid username or password");
            }
        } catch (error) {
            console.error("Login Failed:", error);
            alert("Failed to login. Please try again later.");
        }
    }

    document.querySelector("#student-form form").addEventListener("submit", function(event) {
        loginUser(event, this);
    });

    document.querySelector("#faculty-form form").addEventListener("submit", function(event) {
        loginUser(event, this);
    });
});
