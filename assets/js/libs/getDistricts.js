import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, addDoc,getDoc,getDocs ,serverTimestamp,doc ,updateDoc   } 
from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
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
  const auth = getAuth();

  function formatDate(date) {
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
  }
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('User is authenticated:', user);
        // Proceed with the Firestore write operation
    } else {
        console.error('User is not authenticated');
        alert('Please log in to continue');
    }
});

window.onload = () => {
    populateDistrictsTable();
    
  
    // Add event listener to search input
    const searchInput = document.getElementById('searchcategory');
    searchInput.addEventListener('input', handleSearchInput);
  };
const DistrictForm = document.getElementById("DistrictForm");
const districts = document.getElementById("districts");
const deliveryfee = document.getElementById("deliveryfee");

async function addDistrict(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way
  
    const name = districts.options[districts.selectedIndex].text; // Get the selected option text
    const fare = deliveryfee.value.trim();

    if (fare === "") {
      alert("Please enter the delivery fee.");
      return;
    }

    try { 
        // Save district details in Firestore
        await addDoc(collection(db, "OurDistricts"), {
            name: name,
            fare: fare,
            createdAt: new Date()
        });
        console.log("District added successfully.");
        alert("District added successfully.");
    } catch (error) {
        console.error("Error adding district:", error);
        alert("Error adding district: " + error.message);
    }
}
async function populateDistrictsTable() {
    console.log("Getting Districts");
    
    const DistrictTableBody = document.querySelector('#districtsListTable tbody');
    
    try {
      const querySnapshot = await getDocs(collection(db, "OurDistricts"));
      querySnapshot.forEach((doc) => {
        const district = doc.data();
        console.log("The District "+district.name);
        
       // spinner.style.display = "none"; // hide spinner;
        const row = document.createElement('tr');
        const createdAt = district.createdAt.toDate().toLocaleDateString();
        row.innerHTML = `
          <td>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" value="" id="categoryCode${doc.id}" />
              <label class="form-check-label" for="categoryCode${doc.id}"></label>
            </div>
          </td>
          
          <td>
            <a href="#" class="text-reset">${district.name}</a>
          </td>
          <td>
            <a href="#" class="text-reset">${district.fare}</a>
          </td>
        
        
          <td>${formatDate(createdAt)}</td>
          <td>
            <div class="dropdown">
              <a href="#" class="text-reset" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="feather-icon icon-more-vertical fs-5"></i>
              </a>
              <ul class="dropdown-menu">
                <li>
                  <a class="dropdown-item delete-district" href="#" data-category-id="${doc.id}">
                    <i class="bi bi-trash me-3"></i>
                    Delete
                  </a>
                </li>
               <li>
    
  </li>
              </ul>
            </div>
          </td>
        `;
        
        DistrictTableBody.appendChild(row);
      });
  
      // Add event listeners for delete buttons
      const deleteButtons = document.querySelectorAll('.delete-category');
      deleteButtons.forEach(button => {
        button.addEventListener('click', handleDeletecategory);
      });
  
    } catch (error) {
      console.error("Error fetching Districts: ", error);
      alert("Error fetching Districts: " + error.message);
    }
  }

DistrictForm.addEventListener('submit', addDistrict);
// Function to handle product deletion
async function handleDeletecategory(event) {
    event.preventDefault();
    const categoryId = event.target.closest('.delete-district').dataset.categoryId;
    
    const confirmation = confirm("Are you sure you want to delete this category ? ");
    if (confirmation) {
      try {
        await deleteDoc(doc(db, "OurDistricts", categoryId));
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
