import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, addDoc,getDocs,serverTimestamp ,deleteDoc ,doc  } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";
import { getAuth,onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";



const firebaseConfig = {
    apiKey: "AIzaSyDVRG9BKj8af4h0abdjz8Tab4pQRq0wzjM",
    authDomain: "panacea-admin.firebaseapp.com",
    projectId: "panacea-admin",
    storageBucket: "panacea-admin.appspot.com",
    messagingSenderId: "800826664196",
    appId: "1:800826664196:web:df61636a3b5a44bf6bdc51"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const auth = getAuth(app);

  const spinner = document.getElementById("prodspinner");
  // Function to format the date
function formatDate(date) {
  const d = new Date(date);
  return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
}
document.addEventListener("DOMContentLoaded",function(){
  spinner.style.display = "block"; // Show spinner;
})
// Function to populate the products table
async function populateCategoryTable() {
  const CategoryTableBody = document.querySelector('#categoriesListTable tbody');
  
  try {
    const querySnapshot = await getDocs(collection(db, "Categories"));
    querySnapshot.forEach((doc) => {
      const category = doc.data();
      spinner.style.display = "none"; // hide spinner;
      const row = document.createElement('tr');
      const createdAt = category.createdAt.toDate().toLocaleDateString();
      row.innerHTML = `
        <td>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="categoryCode${doc.id}" />
            <label class="form-check-label" for="categoryCode${doc.id}"></label>
          </div>
        </td>
        <td>
          <a href="#!">
            <img src="${category.imageUrl}" alt="" class="icon-shape icon-md" />
          </a>
        </td>
        <td>
          <a href="#" class="text-reset">${category.name}</a>
        </td>
       
        <td>
          <span class="badge bg-light-primary text-dark-primary">${category.status === true ? "Active" : "Active"}</span>
        </td>
      
        <td>${formatDate(createdAt)}</td>
        <td>
          <div class="dropdown">
            <a href="#" class="text-reset" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="feather-icon icon-more-vertical fs-5"></i>
            </a>
            <ul class="dropdown-menu">
              <li>
                <a class="dropdown-item delete-category" href="#" data-category-id="${doc.id}">
                  <i class="bi bi-trash me-3"></i>
                  Delete
                </a>
              </li>
             <li>
  <a class="dropdown-item edit-category" href="add-category.html?docID=${doc.id}">
    <i class="bi bi-pencil-square me-3"></i>
    Edit
  </a>
</li>
            </ul>
          </div>
        </td>
      `;
      
      CategoryTableBody.appendChild(row);
    });

    // Add event listeners for delete buttons
    const deleteButtons = document.querySelectorAll('.delete-category');
    deleteButtons.forEach(button => {
      button.addEventListener('click', handleDeletecategory);
    });

  } catch (error) {
    console.error("Error fetching category: ", error);
    alert("Error fetching category: " + error.message);
  }
}

// Function to handle product deletion
async function handleDeletecategory(event) {
  event.preventDefault();
  const categoryId = event.target.closest('.delete-category').dataset.categoryId;
  
  const confirmation = confirm("Are you sure you want to delete this category ? ");
  if (confirmation) {
    try {
      await deleteDoc(doc(db, "Categories", categoryId));
      alert("Product deleted successfully.");
      // Refresh the table after deletion
      document.querySelector('#categoriesListTable tbody').innerHTML = '';
      populateCategoryTable();
    } catch (error) {
      console.error("Error deleting product: ", error);
      alert("Error deleting category: " + error.message);
    }
  }
}

// Function to handle search input
function handleSearchInput() {
  const searchInput = document.getElementById('searchcategory');
  const filter = searchInput.value.toUpperCase();
  const tableRows = document.querySelectorAll('#categoriesListTable tbody tr');
  
  tableRows.forEach((row) => {
    const categoryName = row.querySelector('td:nth-child(3)');
    if (categoryName) {
      const textValue = categoryName.textContent || categoryName.innerText;
      if (textValue.toUpperCase().indexOf(filter) > -1) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    }else{
      alert("Not found");
    }
  });
}

// Call the function to populate the table when the page loads
window.onload = () => {
  populateCategoryTable();

  // Add event listener to search input
  const searchInput = document.getElementById('searchcategory');
  searchInput.addEventListener('input', handleSearchInput);
};