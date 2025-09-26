import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, addDoc,query,where,getDocs ,serverTimestamp,doc ,updateDoc,increment    } 
from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
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
  const auth = getAuth(app);
  const posLoadSpinner = $("#posLoad");
  async function populateCategoryDropdown() {
    const categoryDropdown = document.getElementById("productCategory");
    
    try {
      const querySnapshot = await getDocs(collection(db, "Categories"));
      querySnapshot.forEach((doc) => {
        const category = doc.data();
        const option = document.createElement("option");
        option.value = category.name;
        option.textContent = category.name;
        categoryDropdown.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching categories: ", error);
     
    }
  }

  
  
  async function populateProductsCards() {
    const ProdList = $(".itemsList");
    try {
      const querySnapshot = await getDocs(collection(db, "Products"));
      querySnapshot.forEach((doc) => {
        const product = doc.data();
        const cardHtml = `
          <div id="itemContainer" class="col-lg-4 col-md-6 col-sm-6" onclick="AddToCart('${doc.id}','${product.code}', '${product.title}', ${product.regularPrice}, '${product.imageUrl}')">
            <div class="card" style="width: 10rem;background-color: #CEEFCE;">
              <img src="${product.imageUrl}" alt="...">
              <div class="card-body">
                <div class="text-center">
                  <small class="card-title ">${product.title}</small><br>
                  <small class="card-title">${product.regularPrice}</small>
                </div>
              </div>
            </div>
          </div>
        `;
        ProdList.append(cardHtml);
        posLoadSpinner.hide();
      });
    } catch (error) {
      console.error("Error fetching Products: ", error);
    }
  }
  function generateOrderID() {
    return Math.random().toString(36).substr(2, 7).toUpperCase();
}
function calculateCartTotal() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let total = cart.reduce((accumulator, item) => {
    return accumulator + (item.price * item.quantity);
  }, 0);
  
  return total;
}
async function ProcessOrder() {
  const user = auth.currentUser;

  const orderId = generateOrderID(); // Function to generate a unique order ID
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalAmount = calculateCartTotal();

  let authSpinner = document.getElementById("authSpinner");
  authSpinner.innerHTML = "Placing Order... ";
  authSpinner.style.display = "block";

  const orderData = {
    orderId: orderId,
    items: cart,
    totalAmount: totalAmount,
    orderedBy: user.uid,
    createdAt: serverTimestamp(),
    status: "Success"
  };

  try {
    // Reference the "POSOrders" collection and add a new document with auto-generated ID
    await addDoc(collection(db, "POSOrders"), orderData);

    // Deduct the quantity from the Products collection
    for (const item of cart) {
      // Find the product document by its code
      const productQuery = query(collection(db, "Products"), where("code", "==", item.code));
      const querySnapshot = await getDocs(productQuery);
      
      if (!querySnapshot.empty) {
        const productDoc = querySnapshot.docs[0];
        const productRef = doc(db, "Products", productDoc.id);

        await updateDoc(productRef, {
          quantity: increment(-item.quantity)
        });
      } else {
        console.error("Product not found for code:", item.code);
      }
    }

    alert("Order placed successfully!");
    authSpinner.innerHTML = "Order placed successfully with order id " + orderId;

    // Clear the cart
    localStorage.removeItem("cart");
  } catch (error) {
    console.error("Error placing order:", error);
    alert("There was an error placing your order. Please try again.");
  }
}
  

  $(document).ready(async function() {
    populateProductsCards();
    populateCategoryDropdown();
  })
  
  $("#placeOrder").on("click", function() {
    $('#purchaseModal').modal('show');
 });
  
   $("#proceedButton").on("click", function() {
   ProcessOrder();
    $('#purchaseModal').modal('hide');
});
$("#cancelButton").on("click", function() {
 $('#purchaseModal').modal('hide');
});