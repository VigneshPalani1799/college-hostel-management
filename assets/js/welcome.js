document.addEventListener("DOMContentLoaded", async function () {
    const token = sessionStorage.getItem("authToken");

    if (!token) {
        alert("Session expired! Redirecting to login...");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/auth/user", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById("user-name").textContent = data.email.split("@")[0];
        } else {
            throw new Error("User not found");
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        alert("Session expired! Please login again.");
        sessionStorage.removeItem("authToken");
        window.location.href = "login.html";
    }

    // Logout function
    document.querySelector(".profile-section").addEventListener("click", function () {
        sessionStorage.removeItem("authToken");
        alert("Logged out successfully!");
        window.location.href = "login.html";
    });
});

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

        // Extract only the username part (before @)
        const username = data.email.split("@")[0];
        document.getElementById("user-name").textContent = username

        if (response.ok) {
            // ✅ Store the JWT token & user role properly
            sessionStorage.setItem("authToken", data.token);
            sessionStorage.setItem("userRole", data.role);

            alert("Login successful! Redirecting...");
            
            // ✅ Redirect based on user role
            if (data.role === "faculty") {
                window.location.href = "faculty_home.html";
            } else {
                window.location.href = "welcome.html";
            }
        } else {
            alert("Invalid username or password");
        }
    } catch (error) {
        console.error("Login Failed:", error);
        alert("Failed to login. Please try again later.");
    }
}

function getLocationAndCheckIn() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            document.getElementById("checkin-status").textContent = `Location fetched: ${latitude}, ${longitude}`;
            
            try {
                const token = sessionStorage.getItem("authToken");
                const response = await fetch("http://localhost:5000/api/student/checkin", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ latitude, longitude })
                });
                
                const data = await response.json();
                const statusMessage = data.success ? "Successfully checked-in" : "Check-in failed";
                document.getElementById("checkin-status").textContent = statusMessage;
                
                // Log every check-in attempt in the database
                await fetch("http://localhost:5000/api/student/logCheckinAttempt", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ latitude, longitude, status: statusMessage })
                });
                
            } catch (error) {
                console.error("Check-in Error:", error);
                document.getElementById("checkin-status").textContent = "Check-in failed. Try again later.";
            }
        }, (error) => {
            document.getElementById("checkin-status").textContent = "GPS access denied. Enable location services.";
        });
    } else {
        document.getElementById("checkin-status").textContent = "Geolocation is not supported by this browser.";
    }
}