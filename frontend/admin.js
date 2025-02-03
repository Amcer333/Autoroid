document.addEventListener("DOMContentLoaded", () => {
    checkAdminAccess();
    fetchUsers();
    fetchAuctions();
});

// ✅ Ensure User is Admin
function checkAdminAccess() {
    const token = localStorage.getItem("authToken");
    if (!token) {
        console.error("No token found! Redirecting to login.");
        alert("Zugriff verweigert! Bitte zuerst anmelden.");
        window.location.href = "login.html";
    }
}

// ✅ Fetch Users for Dropdown
function fetchUsers() {
    const token = localStorage.getItem("authToken");
    console.log("Fetching users with token:", token);

    fetch("http://localhost:5000/api/admin/users", {
        method: "GET",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
    })
    .then(response => response.json())
    .then(users => {
        console.log("Users fetched:", users);
        const userDropdown = document.getElementById("delete-user-list");

        userDropdown.innerHTML = "";

        users.forEach(user => {
            const option = document.createElement("option");
            option.value = user.id;
            option.textContent = user.username;
            userDropdown.appendChild(option);
        });

        console.log("User dropdown populated successfully.");
    })
    .catch(error => {
        console.error("Error fetching users:", error);
    });
}

// ✅ Fetch Auctions for Dropdown
function fetchAuctions() {
    const token = localStorage.getItem("authToken");
    console.log("Fetching auctions with token:", token);

    fetch("http://localhost:5000/api/admin/auctions", {
        method: "GET",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
    })
    .then(response => response.json())
    .then(auctions => {
        console.log("Auctions fetched:", auctions);
        const auctionDropdown = document.getElementById("auction-dropdown");
        const scheduleDropdown = document.getElementById("schedule-auction-dropdown");

        auctionDropdown.innerHTML = "";
        scheduleDropdown.innerHTML = "";

        auctions.forEach(auction => {
            const option = document.createElement("option");
            option.value = auction.id;
            option.textContent = auction.name;
            auctionDropdown.appendChild(option);

            const scheduleOption = document.createElement("option");
            scheduleOption.value = auction.id;
            scheduleOption.textContent = auction.name;
            scheduleDropdown.appendChild(scheduleOption);
        });

        console.log("Auction dropdowns populated successfully.");
    })
    .catch(error => {
        console.error("Error fetching auctions:", error);
    });
}
