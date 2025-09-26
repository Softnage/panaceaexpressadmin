// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, Timestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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
const db = getFirestore(app);

async function getRedundantProducts() {
  const now = new Date();
  const fiveMonthsAgo = new Date(now.setMonth(now.getMonth() - 5));

  try {
    const productsRef = collection(db, "Products");
    const productsSnapshot = await getDocs(productsRef);

    const redundantProducts = [];

    for (const productDoc of productsSnapshot.docs) {
      const productData = productDoc.data();
      const productAddedDate = productData.createdAt.toDate();
      const code = productData.code;

      if (productAddedDate <= fiveMonthsAgo) {
        $("#redundantMessage").hide();
        const salesQuery = query(collection(db, "Orders"), where("code", "==", code));
        const salesSnapshot = await getDocs(salesQuery);

        if (salesSnapshot.empty) {
          redundantProducts.push({
            id: code,
            name: productData.title,
            category: productData.category,
            price: productData.regularPrice,
            quantity: productData.quantity
          });
        }
      }
    }

    populateRedundantProductsTable(redundantProducts);
  } catch (error) {
    console.error("Error fetching redundant products: ", error);
    alert("Error fetching redundant products: " + error.message);
  }
}

function populateRedundantProductsTable(products) {
  const productsTableBody = document.querySelector('#redundantProductsTable tbody');
  productsTableBody.innerHTML = '';

  products.forEach(product => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="orderOne"/>
          <label class="form-check-label" for="orderOne"></label>
        </div>
      </td>
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${product.price}</td>
      <td>${product.quantity}</td>
    `;
    productsTableBody.appendChild(row);
  });
}

$(document).ready(function() {
  getRedundantProducts();
});
