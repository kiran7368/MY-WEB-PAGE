// ========================================================================
// Firebase Imports (Import each module ONCE)
// ========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, push, get, onValue, set } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

// ========================================================================
// Firebase Configuration (Define ONCE)
// ========================================================================
const firebaseConfig = {
    // IMPORTANT: Replace "YOUR_API_KEY" with your actual Firebase Web API Key
    // It's generally recommended to manage API keys securely, but for this example:
    apiKey: "AIzaSyD4Pdyy-WKtCbrzCEGwF8DZ0r2SgCjQerc",
    authDomain: "drug-inventory-3bc04.firebaseapp.com",
    projectId: "drug-inventory-3bc04",
    storageBucket: "drug-inventory-3bc04.firebasestorage.app",
    messagingSenderId: "1065908954555",
    appId: "1:1065908954555:web:bf32d4ff49411e8f11909e",
    measurementId: "G-X6WSJF9F3X"
};

// ========================================================================
// Firebase Initialization (Initialize ONCE)
// ========================================================================
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app); // Initialize Firebase Auth
const inventoryRef = ref(database, 'inventory'); // Reference to the 'inventory' node

// ========================================================================
// Helper Functions (Define ONCE)
// ========================================================================

/**
 * Renders the inventory items into the HTML table.
 * @param {Array} items - An array of inventory item objects.
 */
function renderInventory(items) {
    const inventoryListBody = document.getElementById('inventory-list-body');
    if (!inventoryListBody) {
        console.error("Element with ID 'inventory-list-body' not found.");
        return; // Exit if the table body doesn't exist
    }
    inventoryListBody.innerHTML = ''; // Clear the table body before rendering new items

    if (!Array.isArray(items) || items.length === 0) {
        // Optionally display a message if the inventory is empty
        // inventoryListBody.innerHTML = '<tr><td colspan="3">No items in inventory.</td></tr>';
        return;
    }

    items.forEach(item => {
        const row = document.createElement('tr');
        // Ensure item properties exist to avoid 'undefined' errors
        row.innerHTML = `
            <td>${item.name || 'N/A'}</td>
            <td>${item.quantity !== undefined ? item.quantity : 'N/A'}</td>
            <td>${item.category || 'N/A'}</td>
        `;
        inventoryListBody.appendChild(row);
    });
}

/**
 * Clears the input fields in the inventory form.
 */
function clearFormFields() {
    const itemNameInput = document.getElementById('item-name');
    const itemQuantityInput = document.getElementById('item-quantity');
    const itemCategoryInput = document.getElementById('item-category');

    if (itemNameInput) itemNameInput.value = '';
    if (itemQuantityInput) itemQuantityInput.value = '';
    if (itemCategoryInput) itemCategoryInput.value = '';
}

// ========================================================================
// Firebase Interaction Functions (Define ONCE)
// ========================================================================

/**
 * Fetches inventory from Firebase and sets up a real-time listener.
 * This should only be called when the user is authenticated.
 */
function fetchInventory() {
    console.log("Attempting to fetch inventory (requires auth)...");
    onValue(inventoryRef, (snapshot) => {
        console.log("Received inventory data snapshot.");
        const inventory = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                // Optional: Include the key if needed for updates/deletes later
                // inventory.push({ id: childSnapshot.key, ...data });
                inventory.push(data);
            });
        } else {
            console.log("No inventory data found at path:", inventoryRef.toString());
        }
        renderInventory(inventory); // Render the fetched data (or empty array)
    }, (error) => {
        // Handle potential errors during the fetch (e.g., network issues after initial permission check)
        console.error("Error fetching inventory data with onValue listener:", error);
        alert(`Error fetching inventory: ${error.message}. Check console for details.`);
        renderInventory([]); // Clear the list on error
    });
}

/**
 * Adds a new item or updates the quantity of an existing item in Firebase.
 * Exposed to the global scope (window) to be callable from HTML onclick.
 */
window.addItem = function() {
    // Basic check - relies on onAuthStateChanged to enable/disable form
    if (!auth.currentUser) {
        alert("Please log in to add items.");
        console.warn("addItem called while user is not logged in.");
        return;
    }

    const itemNameInput = document.getElementById('item-name');
    const itemQuantityInput = document.getElementById('item-quantity');
    const itemCategoryInput = document.getElementById('item-category');

    // Check if elements exist before accessing value
    const itemName = itemNameInput?.value.trim();
    const itemQuantityStr = itemQuantityInput?.value;
    const itemCategory = itemCategoryInput?.value.trim();

    // Input Validation
    if (!itemName || !itemQuantityStr || !itemCategory) {
        alert("Please fill out all fields (Name, Quantity, Category).");
        return;
    }

    const itemQuantity = parseInt(itemQuantityStr, 10); // Use radix 10
    if (isNaN(itemQuantity) || itemQuantity <= 0) {
        alert("Please enter a valid positive number for quantity.");
        return;
    }

    console.log("Attempting to add/update item:", { itemName, itemQuantity, itemCategory });

    // Use get() to check for existing item based on name and category
    get(inventoryRef).then((snapshot) => {
        let itemExists = false;
        let itemKey = null;
        let existingQuantity = 0;

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                // Case-insensitive comparison, ensure data exists
                if (data && data.name && data.category &&
                    data.name.toLowerCase() === itemName.toLowerCase() &&
                    data.category.toLowerCase() === itemCategory.toLowerCase()) {
                    itemExists = true;
                    itemKey = childSnapshot.key;
                    existingQuantity = data.quantity || 0; // Default to 0 if quantity missing
                }
            });
        }

        if (itemExists && itemKey) {
            // --- Update existing item ---
            const updatedQuantity = existingQuantity + itemQuantity;
            const itemRefToUpdate = ref(database, `inventory/${itemKey}`);
            console.log(`Updating item ${itemKey} (${itemName}) quantity to ${updatedQuantity}`);
            set(itemRefToUpdate, {
                name: itemName, // Keep original casing or normalize as needed
                quantity: updatedQuantity,
                category: itemCategory // Keep original casing or normalize
            })
            .then(() => {
                console.log("Item quantity updated successfully!");
                alert("Item quantity updated successfully!");
                clearFormFields();
            })
            .catch((error) => {
                console.error("Error updating item: ", error);
                alert(`Error updating item: ${error.message}`);
            });
        } else {
            // --- Add new item ---
            const newItemRef = push(inventoryRef); // Generate unique key for new item
            console.log(`Adding new item:`, { name: itemName, quantity: itemQuantity, category: itemCategory });
            set(newItemRef, {
                name: itemName,
                quantity: itemQuantity,
                category: itemCategory
            })
            .then(() => {
                console.log("Item added successfully!");
                alert("Item added successfully!");
                clearFormFields();
            })
            .catch((error) => {
                console.error("Error adding new item: ", error);
                alert(`Error adding item: ${error.message}`);
            });
        }
    }).catch((error) => {
        // This catch handles errors during the initial 'get' check (e.g., permission denied if rules changed)
        console.error("Error checking inventory before add/update: ", error);
        alert(`Error accessing inventory: ${error.message}`);
    });
};

/**
 * Searches inventory items based on name or category and renders the results.
 * Exposed to the global scope (window) to be callable from HTML onclick.
 */
window.searchItems = function() {
    // Basic check
    if (!auth.currentUser) {
        alert("Please log in to search items.");
        console.warn("searchItems called while user is not logged in.");
        return;
    }

    const searchInput = document.getElementById('search-input');
    const queryText = searchInput?.value.toLowerCase().trim() || '';
    console.log("Searching inventory for:", queryText);

    // Use get() for a one-time fetch for search results
    get(inventoryRef).then((snapshot) => {
        const filteredItems = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const item = childSnapshot.val();
                // Ensure item and properties exist before searching
                if (item && item.name && item.category && (
                    item.name.toLowerCase().includes(queryText) ||
                    item.category.toLowerCase().includes(queryText)
                )) {
                    filteredItems.push(item);
                }
            });
        }
        console.log("Search found items:", filteredItems.length);
        renderInventory(filteredItems); // Render only the filtered results
    }).catch((error) => {
        console.error("Error searching items:", error);
        alert(`Error searching inventory: ${error.message}`);
        renderInventory([]); // Clear list on search error
    });
};

// ========================================================================
// Authentication State Listener (The Core Logic for Handling Auth)
// ========================================================================
console.log("Setting up Firebase Authentication state listener...");

onAuthStateChanged(auth, (user) => {
  const formElements = document.querySelectorAll('#inventory-form input, #inventory-form button, #search-input, #search-button');

  if (user) {
    // --- User is Signed In ---
    console.log("User is signed in:", user.uid);

    // Enable form elements for interaction
    formElements.forEach(el => el.disabled = false);

    // **Crucial:** Fetch inventory data ONLY AFTER confirming user is signed in
    fetchInventory();

  } else {
    // --- User is Signed Out ---
    console.log("User is signed out.");

    // Clear any previously displayed inventory data
    renderInventory([]);

    // Disable form elements to prevent interaction
    formElements.forEach(el => el.disabled = true);

    // Optional: Provide feedback or redirect
    // alert("Please log in to manage inventory.");
    // Consider redirecting if this page strictly requires login:
    // window.location.href = '/login.html'; // Adjust path as needed
  }
});

// ========================================================================
// END OF SCRIPT
// ========================================================================
// Note: No initial fetchInventory() call here - it's handled by onAuthStateChanged.
