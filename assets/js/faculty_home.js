document.addEventListener("DOMContentLoaded", function () {
    const token = sessionStorage.getItem("authToken");

    
    if (!token) {
        alert("Session expired! Redirecting to login...");
        window.location.href = "login.html";
        return;
    }

    document.querySelector(".profile-section").addEventListener("click", function () {
        sessionStorage.removeItem("authToken");
        alert("Logged out successfully!");
        window.location.href = "login.html";
    });

    async function searchStudent() {
        const studentEmail = document.getElementById("student-email").value.trim();
        if (!studentEmail) {
            alert("Please enter a student email to search.");
            return;
        }

        // Extract only the username part (before @)
        const username = studentEmail.split("@")[0];

        try {
            const response = await fetch(`http://localhost:5000/api/faculty/query?studentEmail=${username}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Failed to fetch student logs.");
                return;
            }

            const logsContainer = document.getElementById("logs-container");
            const logsTable = document.getElementById("logs-table");
            logsTable.innerHTML = ""; // Clear previous results

            if (data.length === 0) {
                logsTable.innerHTML = "<tr><td colspan='2'>No check-in records found.</td></tr>";
            } else {
                data.forEach(log => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${new Date(log.checkInTime).toLocaleString()}</td>
                        <td>${log.checkOutTime ? new Date(log.checkOutTime).toLocaleString() : "Not Checked Out"}</td>
                        <td>${log.status}</td>
                        <td>(${log.location.latitude}, ${log.location.longitude})</td>
                    `;
                    logsTable.appendChild(row);
                });
            }
            
            logsContainer.classList.remove("hidden");
        } catch (error) {
            console.error("Error fetching student logs:", error);
            alert("An error occurred while fetching student logs.");
        }
    }
    
    window.searchStudent = searchStudent;
});
