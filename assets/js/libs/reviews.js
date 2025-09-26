// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, addDoc,getDocs,query, where  } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Your web app's Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);
const spinner = document.getElementById("reviewsSpinner");



async function getUserName(userid) {
    let fullname = "";
    try {
      const customerReg = collection(db, "Customers");
      const q = query(customerReg, where("userID", "==", userid));
      const querySnapshot = await getDocs(q);
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fullname = `${data.firstname} ${data.lastname}`;
      });
    } catch (error) {
      console.error("Error fetching customer: ", error);
      alert("Error fetching customer: " + error.message);
    }
    return fullname;
  }

  async function populateReviewsTable() {
    spinner.style.display = "block"; // Show spinner;
    const reviewsTableBody = document.querySelector('#reviewListTable tbody');
    reviewsTableBody.innerHTML = '';
  
    try {
      const productsSnapshot = await getDocs(collection(db, "Products"));
      for (const productDoc of productsSnapshot.docs) {
        const productData = productDoc.data();
        const productName = productData.title;
        const reviewsSnapshot = await getDocs(collection(db, `Products/${productDoc.id}/Reviews`));
  
        const reviewPromises = reviewsSnapshot.docs.map(async (reviewDoc) => {
          const reviewData = reviewDoc.data();
          const createdAt = reviewData.createdAt.toDate();
          const formattedDate = createdAt.toLocaleDateString(); // e.g., "MM/DD/YYYY"
          const formattedTime = createdAt.toLocaleTimeString(); // e.g., "HH:MM:SS AM/PM"
          const timestamp = `${formattedDate} (${formattedTime})`;
  
          const userName = await getUserName(reviewData.createdBy);
  
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="orderOne"/>
                <label class="form-check-label" for="orderOne"></label>
              </div>
            </td>
            <td>${productName}</td>
            <td>${userName}</td>
            <td>${reviewData.headline}</td>
            <td>${reviewData.rating}</td>
            <td>${timestamp}</td>
            <td>
            <div class="dropdown">
              <a href="#" class="text-reset" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="feather-icon icon-more-vertical fs-5"></i>
              </a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#"><i class="bi bi-trash me-3"></i>Delete</a></li>
                <li><a class="dropdown-item" href="#"><i class="bi bi-pencil-square me-3"></i>Edit</a></li>
              </ul>
            </div>
          </td>
          `;
          spinner.style.display = "none"; // hide spinner;
          reviewsTableBody.appendChild(row);
        });
  
        await Promise.all(reviewPromises);
      }
    } catch (error) {
      console.error("Error fetching Reviews: ", error);
      alert("Error fetching Reviews: " + error.message);
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    populateReviewsTable();
  });