document.addEventListener("DOMContentLoaded", () => {
    checkAdminAccess();
});

function checkAdminAccess() {
    const token = localStorage.getItem("authToken");
    console.log("Stored authToken (user ID):", token);

    if (!token) {
        alert("Zugriff verweigert! Bitte zuerst anmelden.");
        window.location.href = "login.html";
        return;
    }

    fetch("http://localhost:5000/api/auth/check-role", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}` 
        },
    })
    .then(response => response.json())
    .then(data => {
        console.log("Admin check received role:", data.role);

        if (data.role !== "admin") {
            alert("Zugriff verweigert! Nur Admins können diese Seite aufrufen.");
            window.location.href = "index.html";
        }
    })
    .catch(error => {
        console.error("Fehler bei der Überprüfung des Admin-Status:", error);
        alert("Fehler beim Überprüfen der Admin-Berechtigung.");
        window.location.href = "index.html";
    });
}

// ✅ Create a new user (Admin only)
function createUser() {
    const username = document.getElementById("new-username").value;
    const password = document.getElementById("new-password").value;
    const role = document.getElementById("new-role").value;
    const token = localStorage.getItem("authToken");

    fetch("http://localhost:5000/api/admin/create-user", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ username, password, role }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Zugriff verweigert! Nur Admins dürfen Benutzer erstellen.");
        }
        return response.json();
    })
    .then(data => alert(data.message))
    .catch(error => console.error("Fehler beim Erstellen des Benutzers:", error));
}

// ✅ Start an auction (Admin only)
function startAuction() {
    const carId = document.getElementById("car-id").value;
    const token = localStorage.getItem("authToken");

    fetch("http://localhost:5000/api/admin/start-auction", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ car_id: carId }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Zugriff verweigert! Nur Admins dürfen Auktionen starten.");
        }
        return response.json();
    })
    .then(data => alert(data.message))
    .catch(error => console.error("Fehler beim Starten der Auktion:", error));
}

// ✅ End an auction (Admin only)
function endAuction() {
    const carId = document.getElementById("car-id").value;
    const token = localStorage.getItem("authToken");

    fetch("http://localhost:5000/api/admin/end-auction", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ car_id: carId }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Zugriff verweigert! Nur Admins dürfen Auktionen beenden.");
        }
        return response.json();
    })
    .then(data => alert(data.message))
    .catch(error => console.error("Fehler beim Beenden der Auktion:", error));
}

// ✅ Logout function
function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    alert("Erfolgreich abgemeldet.");
    window.location.href = "login.html";
}
