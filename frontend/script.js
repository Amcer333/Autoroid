let socket;

document.addEventListener("DOMContentLoaded", () => {
    setupWebSocket();
    checkAuthentication();
    fetchCars();
});

// ✅ Check login status and show "Admin Panel" button if admin
function checkAuthentication() {
    const token = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole"); // Get stored role
    const loginStatus = document.getElementById("login-status");
    const authActions = document.getElementById("auth-actions");
    const adminPanelBtn = document.getElementById("admin-panel-btn");

    if (!token) {
        loginStatus.textContent = "Nicht angemeldet";
        authActions.innerHTML = `<button onclick="window.location.href='login.html'">Anmelden</button>`;
        return;
    }

    loginStatus.textContent = `Angemeldet als ${userRole || "Benutzer"}`;
    authActions.innerHTML = `<button onclick="logout()">Abmelden</button>`;

    // Show admin panel button if user is an admin
    if (userRole === "admin") {
        adminPanelBtn.style.display = "block";
    }
}


// ✅ Redirect to Admin Panel
function goToAdmin() {
    window.location.href = "admin.html";
}

// ✅ Logout function
function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    alert("Erfolgreich abgemeldet.");
    window.location.href = "login.html";
}

// ✅ Fetch all cars from the server
function fetchCars() {
    fetch("http://localhost:5000/api/cars")
        .then(response => response.json())
        .then(cars => {
            const carList = document.getElementById("car-list");
            carList.innerHTML = "";

            cars.forEach(car => {
                const carCard = document.createElement("div");
                carCard.classList.add("car-card");
                carCard.setAttribute("data-id", car.id);
                carCard.innerHTML = `
                    <h3>${car.name}</h3>
                    <p>${car.description}</p>
                    <p><strong>Startpreis:</strong> €${car.starting_price}</p>
                    <p><strong>Höchstes Gebot:</strong> €<span class="highest-bid">${car.highest_bid}</span></p>
                    <p><strong>Status:</strong> <span class="auction-status">${car.auction_status || "Wartet auf Start"}</span></p>
                    <input type="number" id="bid-${car.id}" placeholder="Ihr Gebot">
                    <button onclick="placeBid(${car.id})">Gebot abgeben</button>
                `;
                carList.appendChild(carCard);
            });
        })
        .catch(error => console.error("Fehler beim Laden der Autos:", error));
}

// ✅ Place a bid for a specific car
function placeBid(carId) {
    const token = localStorage.getItem("authToken");
    if (!token) {
        alert("Bitte melden Sie sich zuerst an, um zu bieten.");
        window.location.href = "login.html";
        return;
    }

    const bidAmount = parseFloat(document.getElementById(`bid-${carId}`).value);
    if (!bidAmount || isNaN(bidAmount)) {
        alert("Bitte geben Sie einen gültigen Betrag ein.");
        return;
    }

    fetch("http://localhost:5000/api/cars/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ car_id: carId, bid_amount: bidAmount }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
        }
        fetchCars();
    })
    .catch(error => console.error("Fehler beim Bieten:", error));
}

// ✅ Setup WebSocket connection for real-time updates
function setupWebSocket() {
    socket = new WebSocket("ws://localhost:5000");

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "bid_update") {
            updateBidOnScreen(data.car_id, data.bid_amount);
        }

        if (data.type === "auction_update") {
            updateAuctionStatus(data.car_id, data.status);
        }
    };

    socket.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
        console.log("WebSocket disconnected. Reconnecting...");
        setTimeout(setupWebSocket, 5000);
    };
}

// ✅ Update bid on the screen in real time
function updateBidOnScreen(carId, newBid) {
    const carCard = document.querySelector(`.car-card[data-id="${carId}"]`);
    if (carCard) {
        const bidElement = carCard.querySelector(".highest-bid");
        bidElement.textContent = newBid;
    }
}

// ✅ Update auction status in real-time
function updateAuctionStatus(carId, newStatus) {
    const carCard = document.querySelector(`.car-card[data-id="${carId}"]`);
    if (carCard) {
        const statusElement = carCard.querySelector(".auction-status");
        statusElement.textContent = newStatus;
    }
}
