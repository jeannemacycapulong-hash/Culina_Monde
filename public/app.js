// ==========================================
// CULINA MONDE - RESTAURANT MANAGEMENT
// ==========================================

const API_URL = "/api/restaurants";

const searchInput = document.getElementById("searchInput");
const addButton = document.getElementById("addButton");
const restaurantTable = document.getElementById("restaurantTable");

const restaurantModal = document.getElementById("restaurantModal");
const restaurantForm = document.getElementById("restaurantForm");

const closeButton = document.getElementById("closeButton");
const formTitle = document.getElementById("formTitle");

const nameInput = document.getElementById("name");
const cuisineInput = document.getElementById("cuisine");
const addressInput = document.getElementById("address");
const ratingInput = document.getElementById("rating");
const contactInput = document.getElementById("contact");

let editingId = null;

let allRestaurants = [];


// ==========================================
// LOAD RESTAURANTS
// ==========================================

async function loadRestaurants() {
    try {
        restaurantTable.innerHTML = `
            <tr>
                <td colspan="7" class="loading-cell">
                    Loading restaurants...
                </td>
            </tr>
        `;

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load restaurants.");
        }

        allRestaurants = await response.json();

        displayRestaurants(allRestaurants);

    } catch (error) {
        console.error(error);

        restaurantTable.innerHTML = `
            <tr>
                <td colspan="7" class="loading-cell">
                    Unable to load restaurants.
                </td>
            </tr>
        `;

        alert("Could not connect to the restaurant database.");
    }
}


// ==========================================
// DISPLAY RESTAURANTS
// ==========================================

function displayRestaurants(restaurants) {

    restaurantTable.innerHTML = "";

    if (restaurants.length === 0) {
        restaurantTable.innerHTML = `
            <tr>
                <td colspan="7" class="loading-cell">
                    No restaurants found.
                </td>
            </tr>
        `;

        return;
    }

    restaurants.forEach((restaurant) => {

        const row = document.createElement("tr");

        // Restaurant ID
        const idCell = document.createElement("td");
        idCell.textContent = restaurant.restaurant_id;

        // Name
        const nameCell = document.createElement("td");
        nameCell.textContent = restaurant.name;

        // Cuisine
        const cuisineCell = document.createElement("td");
        cuisineCell.textContent = restaurant.cuisine;

        // Address
        const addressCell = document.createElement("td");
        addressCell.textContent = restaurant.address;

        // Rating
        const ratingCell = document.createElement("td");
        ratingCell.textContent = restaurant.rating.toFixed(1);

        // Contact
        const contactCell = document.createElement("td");
        contactCell.textContent = restaurant.contact;

        // Actions
        const actionsCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "action-button";

        editButton.addEventListener("click", () => {
            openEditModal(restaurant);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "action-button delete";

        deleteButton.addEventListener("click", () => {
            deleteRestaurant(restaurant.restaurant_id);
        });

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);

        row.appendChild(idCell);
        row.appendChild(nameCell);
        row.appendChild(cuisineCell);
        row.appendChild(addressCell);
        row.appendChild(ratingCell);
        row.appendChild(contactCell);
        row.appendChild(actionsCell);

        restaurantTable.appendChild(row);
    });
}


// ==========================================
// SEARCH RESTAURANTS
// ==========================================

searchInput.addEventListener("input", () => {

    const searchTerm = searchInput.value
        .toLowerCase()
        .trim();

    if (searchTerm === "") {
        displayRestaurants(allRestaurants);
        return;
    }

    const filteredRestaurants = allRestaurants.filter((restaurant) => {

        return (
            restaurant.name.toLowerCase().includes(searchTerm) ||
            restaurant.cuisine.toLowerCase().includes(searchTerm) ||
            restaurant.address.toLowerCase().includes(searchTerm) ||
            restaurant.contact.toLowerCase().includes(searchTerm)
        );
    });

    displayRestaurants(filteredRestaurants);
});


// ==========================================
// OPEN ADD MODAL
// ==========================================

addButton.addEventListener("click", () => {

    editingId = null;

    formTitle.textContent = "Add Restaurant";

    restaurantForm.reset();

    restaurantModal.classList.add("show");

    nameInput.focus();
});


// ==========================================
// OPEN EDIT MODAL
// ==========================================

function openEditModal(restaurant) {

    editingId = restaurant.restaurant_id;

    formTitle.textContent = "Update Restaurant";

    nameInput.value = restaurant.name;
    cuisineInput.value = restaurant.cuisine;
    addressInput.value = restaurant.address;
    ratingInput.value = restaurant.rating;
    contactInput.value = restaurant.contact;

    restaurantModal.classList.add("show");

    nameInput.focus();
}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {

    restaurantModal.classList.remove("show");

    editingId = null;

    restaurantForm.reset();
}

closeButton.addEventListener("click", closeModal);


restaurantModal.addEventListener("click", (event) => {

    if (event.target === restaurantModal) {
        closeModal();
    }
});


document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
        closeModal();
    }
});


// ==========================================
// ADD / UPDATE RESTAURANT
// ==========================================

restaurantForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const restaurantData = {
        name: nameInput.value.trim(),
        cuisine: cuisineInput.value.trim(),
        address: addressInput.value.trim(),
        rating: Number(ratingInput.value),
        contact: contactInput.value.trim()
    };

    if (
        !restaurantData.name ||
        !restaurantData.cuisine ||
        !restaurantData.address ||
        !restaurantData.contact
    ) {
        alert("Please complete all fields.");
        return;
    }

    if (
        Number.isNaN(restaurantData.rating) ||
        restaurantData.rating < 0 ||
        restaurantData.rating > 5
    ) {
        alert("Rating must be between 0 and 5.");
        return;
    }

    try {

        let response;

        if (editingId !== null) {

            response = await fetch(
                `${API_URL}/${editingId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(restaurantData)
                }
            );

        }

        else {

            response = await fetch(
                API_URL,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(restaurantData)
                }
            );
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Operation failed."
            );
        }

        if (editingId !== null) {
            alert("Restaurant updated successfully!");
        } else {
            alert("Restaurant added successfully!");
        }

        closeModal();

        await loadRestaurants();

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Something went wrong. Please try again."
        );
    }
});


// ==========================================
// DELETE RESTAURANT
// ==========================================

async function deleteRestaurant(id) {

    const restaurant = allRestaurants.find(
        (item) => item.restaurant_id === id
    );

    if (!restaurant) {
        return;
    }

    const confirmed = confirm(
        `Are you sure you want to delete "${restaurant.name}"?`
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Failed to delete restaurant."
            );
        }

        alert("Restaurant deleted successfully!");

        await loadRestaurants();

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Could not delete the restaurant."
        );
    }
}


// ==========================================
// START APPLICATION
// ==========================================

loadRestaurants();