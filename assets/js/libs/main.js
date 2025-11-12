// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection,where, getDocs,doc,query  } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getAuth ,onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
const firebaseConfig = {
    apiKey: "AIzaSyDVRG9BKj8af4h0abdjz8Tab4pQRq0wzjM",
    authDomain: "panacea-admin.firebaseapp.com",
    projectId: "panacea-admin",
    storageBucket: "panacea-admin.appspot.com",
    messagingSenderId: "800826664196",
    appId: "1:800826664196:web:df61636a3b5a44bf6bdc51"
  };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
    console.log("Signed In");
    
    // Only run dashboard functions if dashboard elements exist
    const totalSalesElement = document.getElementById('totalSales') || document.querySelector('#totalSales');
    if (totalSalesElement || (typeof $ !== 'undefined' && $("#totalSales").length > 0)) {
      GetTotalOrders();
      GetTotalCustomers();
      
      getTotalSales().then((totalSales) => {
        if (typeof $ !== 'undefined') {
          if ($("#totalSales").length > 0) {
            $("#totalSales").html("GHS"+ FormatTotal(totalSales));
          }
          if ($("#incomeTotal2").length > 0) {
            $("#incomeTotal2").html("GHS"+ FormatTotal(totalSales));
          }
        }
      }).catch((error) => {
        console.error('Failed to get total sales:', error);
      });
    }
  
    } else {
      // User is signed out
      // ...
      console.log("User is signed out");
    }
  });
  async function getOrdersCount() {
    const db = getFirestore();
    const querySnapshot = await getDocs(collection(db, "Orders"));
  
    return querySnapshot.size; // Returns the number of documents in the collection
  }
  async function getCustomerCount() {
    const db = getFirestore();
    const querySnapshot = await getDocs(collection(db, "Customers"));
  
    return querySnapshot.size; // Returns the number of documents in the collection
  }

  async function GetTotalOrders() {
    try {
      const count = await getOrdersCount();
      const totalOrdersElement = document.getElementById("totalOrders");
      const orderTotal2Element = document.getElementById("orderTotal2");
      
      if (totalOrdersElement) {
        totalOrdersElement.innerHTML = count;
      }
      if (orderTotal2Element) {
        orderTotal2Element.innerHTML = count;
      }
    } catch (error) {
      console.error("Error retrieving orders count:", error);
    }
  }
  async function GetTotalCustomers() {
    try {
      const count = await getCustomerCount();
      const totalCustomersElement = document.getElementById("totalCustomers");
      
      if (totalCustomersElement) {
        totalCustomersElement.innerHTML = count;
      }
    } catch (error) {
      console.error("Error retrieving customers count:", error);
    }
  }
 
  async function getTotalSales() {
    const db = getFirestore(); // Initialize Firestore

    try {
        // Query orders collection where status is "Success"
        const ordersRef = collection(db, 'Orders');
        const q = query(ordersRef, where('status', '==', 'Success'));
        const querySnapshot = await getDocs(q);

        // Initialize total sales amount
        let totalSales = 0;

        // Iterate through each document and sum up totalAmount
        querySnapshot.forEach((doc) => {
            const order = doc.data();
            const totalAmount = order.totalAmount; // Adjust this according to your data structure
            totalSales += totalAmount;
        });

        return totalSales;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw new Error('Failed to fetch orders');
    }
}
function FormatTotal(amount) {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function calculatePercentage(value, total) {
  if (total === 0) {
      return "0%"; // To handle division by zero scenario
  }
  
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(2)}%`; // Format to two decimal places
}
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
async function getAboutToExpireProducts() {
  const now = new Date();
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(now.getMonth() + 3);

  const formattedNow = formatDate(now);
  const formattedThreeMonthsLater = formatDate(threeMonthsLater);

  try {
    const productsRef = collection(db, "Products");
    const productsSnapshot = await getDocs(productsRef);

    const aboutToExpireProducts = [];

    for (const productDoc of productsSnapshot.docs) {
      const productData = productDoc.data();
      const expirationDate = productData.expiryDate;

      if (expirationDate > formattedNow && expirationDate <= formattedThreeMonthsLater) {
        aboutToExpireProducts.push({
          id: productData.code,
          name: productData.title,
          expirationDate: expirationDate,
          quantity: productData.quantity
        });
      }
    }

    // Get the total number of products that are about to expire
    const totalAboutToExpireProducts = aboutToExpireProducts.length;
    console.log("Total about to expire products: " + totalAboutToExpireProducts);
    
    // Only update DOM element if it exists on the current page
    const aboutToExpireElement = document.getElementById("totalAboutToExpireProducts");
    if (aboutToExpireElement) {
      aboutToExpireElement.innerHTML = totalAboutToExpireProducts;
    }
   
  } catch (error) {
    console.error("Error fetching about to expire products: ", error);
    // Only show alert if we're on a page that should display this information
    const aboutToExpireElement = document.getElementById("totalAboutToExpireProducts");
    if (aboutToExpireElement) {
      alert("Error fetching about to expire products: " + error.message);
    }
  }
}



async function getExpiredProducts() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(now.getDate()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}`;

  try {
    const productsRef = collection(db, "Products");
    const productsSnapshot = await getDocs(productsRef);

    const expiredProducts = [];

    for (const productDoc of productsSnapshot.docs) {
      const productData = productDoc.data();
      const expirationDate = productData.expiryDate;

      if (expirationDate <= formattedDate) {
        expiredProducts.push({
          id: productData.code,
          name: productData.title,
          expirationDate: expirationDate, // Keep the expiration date format as is
          quantity: productData.quantity
        });
      }
    }

    // Get the total number of expired products
    const totalExpiredProducts = expiredProducts.length;
    console.log("Total expired products: " + totalExpiredProducts);
    
    // Only update DOM element if it exists on the current page
    const expiredProductsElement = document.getElementById("totalExpiredProducts");
    if (expiredProductsElement) {
      expiredProductsElement.innerHTML = totalExpiredProducts;
    }

   
  } catch (error) {
    console.error("Error fetching expired products: ", error);
    // Only show alert if we're on a page that should display this information
    const expiredProductsElement = document.getElementById("totalExpiredProducts");
    if (expiredProductsElement) {
      alert("Error fetching expired products: " + error.message);
    }
  }
}

window.onload = function() {
  getAboutToExpireProducts();
  getExpiredProducts();
}

// Export Firebase instances for use in other modules
export { app, auth, db };