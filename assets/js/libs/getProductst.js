import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  deleteDoc,
  doc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDVRG9BKj8af4h0abdjz8Tab4pQRq0wzjM",
  authDomain: "panacea-admin.firebaseapp.com",
  projectId: "panacea-admin",
  storageBucket: "panacea-admin.appspot.com",
  messagingSenderId: "800826664196",
  appId: "1:800826664196:web:df61636a3b5a44bf6bdc51",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
let currentPage = 1;
const itemsPerPage = 20;
const spinner = document.getElementById("prodspinner");

// Helper function to safely format Firebase timestamp to date string
function formatFirestoreDate(timestamp, fallback = "N/A") {
  try {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString("en-US");
    } else if (timestamp) {
      // Handle case where timestamp might be a regular Date or string
      return new Date(timestamp).toLocaleDateString("en-US");
    }
  } catch (error) {
    console.warn("Error formatting date:", error);
  }
  return fallback;
}

window.goToPage = function (pageNumber) {
  currentPage = pageNumber;
  populateProductsTable(); // Reload the table with the new page
};
function updatePaginationControls(totalPages) {
  const paginationControls = $("#paginationControls");
  paginationControls.empty();

  if (totalPages <= 1) return; // Don't show pagination for single page

  const maxVisiblePages = 5; // Maximum number of page buttons to show
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // Adjust start page if we're near the end
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // Previous button
  if (currentPage > 1) {
    paginationControls.append(
      `<button class="btn btn-outline-primary mx-1" onclick="goToPage(${
        currentPage - 1
      })" title="Previous page">
        <i class="bi bi-chevron-left"></i>
      </button>`
    );
  }

  // First page button (if not already visible)
  if (startPage > 1) {
    paginationControls.append(
      `<button class="btn btn-outline-primary mx-1" onclick="goToPage(1)">1</button>`
    );
    
    // Add ellipsis if there's a gap
    if (startPage > 2) {
      paginationControls.append(
        `<span class="mx-1 align-self-center">...</span>`
      );
    }
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    paginationControls.append(
      `<button class="mx-1 btn ${
        i === currentPage ? "btn-primary" : "btn-outline-primary"
      }" onclick="goToPage(${i})" ${
        i === currentPage ? 'title="Current page"' : `title="Go to page ${i}"`
      }>${i}</button>`
    );
  }

  // Last page button (if not already visible)
  if (endPage < totalPages) {
    // Add ellipsis if there's a gap
    if (endPage < totalPages - 1) {
      paginationControls.append(
        `<span class="mx-1 align-self-center">...</span>`
      );
    }
    
    paginationControls.append(
      `<button class="btn btn-outline-primary mx-1" onclick="goToPage(${totalPages})">${totalPages}</button>`
    );
  }

  // Next button
  if (currentPage < totalPages) {
    paginationControls.append(
      `<button class="btn btn-outline-primary mx-1" onclick="goToPage(${
        currentPage + 1
      })" title="Next page">
        <i class="bi bi-chevron-right"></i>
      </button>`
    );
  }
}
// Function to format the date
function formatDate(date) {
  const d = new Date(date);
  return `${d.getDate()} ${d.toLocaleString("default", {
    month: "short",
  })} ${d.getFullYear()}`;
}
document.addEventListener("DOMContentLoaded", function () {
  spinner.style.display = "block"; // Show spinner;
});
// Function to populate the products table
async function populateProductsTable() {
  const productsTableBody = $("#productsListTable tbody");
  const spinner = $("#prodspinner"); // Assuming you have a spinner element

  try {
    const querySnapshot = await getDocs(collection(db, "Products"));
    const products = [];

    querySnapshot.forEach((doc) => {
      const product = doc.data();
      products.push({
        id: doc.id,
        ...product,
      });
    });

    // Calculate total pages
    const totalPages = Math.ceil(products.length / itemsPerPage);

    // Slice the product list to get only the items for the current page
    const paginatedProducts = products.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    // Clear the table before appending new rows
    productsTableBody.empty();

    paginatedProducts.forEach((product) => {
      spinner.hide(); // Hide spinner;
      const row = $("<tr></tr>");
      
      // Handle timestamp fields safely using helper function
      const formattedDate = formatFirestoreDate(product.createdAt);
      const formattedLastUpdated = formatFirestoreDate(product.lastedUpdated);

      row.html(`
        <td>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="productCode${
              product.id
            }" />
            <label class="form-check-label" for="productCode${
              product.id
            }"></label>
          </div>
        </td>
        <td>
          <a href="#!">
            <img src="${product.imageUrl}" alt="" class="icon-shape icon-md" />
          </a>
        </td>
        <td>
          <a href="#" class="text-reset">${product.title}</a>
        </td>
        <td>${product.category}</td>
        <td>${product.regularPrice}</td>
        <td>${formattedLastUpdated}</td>
        <td>
          <div class="dropdown">
            <a href="#" class="text-reset" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="feather-icon icon-more-vertical fs-5"></i>
            </a>
            <ul class="dropdown-menu">
              <li>
                <a class="dropdown-item delete-product" href="#" data-product-id="${
                  product.id
                }">
                  <i class="bi bi-trash me-3"></i>
                  Delete
                </a>
              </li>
              <li>
                <a class="dropdown-item edit-product" href="newProd.html?docID=${
                  product.id
                }&returnPage=${currentPage}">
                  <i class="bi bi-pencil-square me-3"></i>
                  Edit
                </a>
              </li>
            </ul>
          </div>
        </td>
      `);

      productsTableBody.append(row);
    });

    // Add event listeners for delete buttons
    $(".delete-product").on("click", handleDeleteProduct);

    // Update pagination controls
    updatePaginationControls(totalPages);
  } catch (error) {
    console.error("Error fetching products: ", error);
    alert("Error fetching products: " + error.message);
  }
}

// Function to handle product deletion
async function handleDeleteProduct(event) {
  event.preventDefault();
  const productId = event.target.closest(".delete-product").dataset.productId;

  const confirmation = confirm(
    "Are you sure you want to delete this product ? "
  );
  if (confirmation) {
    try {
      await deleteDoc(doc(db, "Products", productId));
      alert("Product deleted successfully.");
      // Refresh the table after deletion
      document.querySelector("#productsListTable tbody").innerHTML = "";
      populateProductsTable();
    } catch (error) {
      console.error("Error deleting product: ", error);
      alert("Error deleting product: " + error.message);
    }
  }
}

// Function to handle search input
async function handleSearchInput() {
  const searchInput = document.getElementById("searchProduct");
  const searchTerm = searchInput.value.trim().toLowerCase();
  const productsTableBody = $("#productsListTable tbody");
  const spinner = $("#prodspinner");

  try {
    spinner.show();
    productsTableBody.empty();

    // Query Firestore for products matching the search term
    const productsRef = collection(db, "Products");
    const q = query(
      productsRef,
      where("lowercaseTitle", ">=", searchTerm),
      where("lowercaseTitle", "<=", searchTerm + "\uf8ff")
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      productsTableBody.html(
        '<tr><td colspan="8" class="text-center">No products found</td></tr>'
      );
    } else {
      querySnapshot.forEach((doc) => {
        const product = doc.data();
        
        // Handle timestamp field safely using helper function
        const formattedDate = formatFirestoreDate(product.createdAt);

        const row = $("<tr></tr>");
        row.html(`
          <td>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="" id="productCode${
                doc.id
              }" />
              <label class="form-check-label" for="productCode${
                doc.id
              }"></label>
            </div>
          </td>
          <td>
            <a href="#!">
              <img src="${
                product.imageUrl
              }" alt="" class="icon-shape icon-md" />
            </a>
          </td>
          <td>
            <a href="#" class="text-reset">${product.title}</a>
          </td>
          <td>${product.category}</td>
          <td>
            <span class="badge bg-light-primary text-dark-primary">${
              product.activeStatus === "inactive" ? "inactive" : "active"
            }</span>
          </td>
          <td>
            <span class="badge bg-light-primary text-dark-primary">
              ${product.isFeatured ? "Featured" : "Not Featured"}
            </span>
          </td>
          <td>${product.regularPrice}</td>
          <td>${formattedDate}</td>
          <td>
            <div class="dropdown">
              <a href="#" class="text-reset" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="feather-icon icon-more-vertical fs-5"></i>
              </a>
              <ul class="dropdown-menu">
                <li>
                  <a class="dropdown-item delete-product" href="#" data-product-id="${
                    doc.id
                  }">
                    <i class="bi bi-trash me-3"></i>
                    Delete
                  </a>
                </li>
                <li>
                  <a class="dropdown-item edit-product" href="newProd.html?docID=${
                    doc.id
                  }&returnPage=${currentPage}">
                    <i class="bi bi-pencil-square me-3"></i>
                    Edit
                  </a>
                </li>
              </ul>
            </div>
          </td>
        `);

        productsTableBody.append(row);
      });

      // Add event listeners for delete buttons
      $(".delete-product").on("click", handleDeleteProduct);
    }
  } catch (error) {
    console.error("Error searching products: ", error);
    productsTableBody.html(
      '<tr><td colspan="8" class="text-center text-danger">Error searching products</td></tr>'
    );
  } finally {
    spinner.hide();
  }
}

// Function to get URL parameter
function getURLParameter(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// Call the function to populate the table when the page loads
window.onload = () => {
  // Check if there's a page parameter and set current page accordingly
  const pageParam = getURLParameter("page");
  if (pageParam) {
    currentPage = parseInt(pageParam) || 1;
  }
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userid = user.uid;
      const userrole = await getUserRole(userid);
      console.log("My role " + userrole);
      if (userrole === "Updater" || userrole === "Admin") {
        populateProductsTable();
      } else {
        window.location.href = "forbidden.html";
      }
    } else {
      // User is signed out
      console.log("Not logged in");
    }
  });

  // Add event listener to search input with debounce
  const searchInput = document.getElementById("searchProduct");
  let searchTimeout;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(handleSearchInput, 300); // Debounce for 300ms
  });
};

async function getUserRole(userid) {
  let userrole = "";
  try {
    const customerReg = collection(db, "Users");
    const q = query(customerReg, where("uid", "==", userid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      userrole = data.role;
    });
  } catch (error) {
    console.error("Error fetching customer: ", error);
    alert("Error fetching customer: " + error.message);
  }
  return userrole;
}
