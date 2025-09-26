// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, addDoc,getDocs,query, where  } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { Timestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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
let currentPage = 1;
const itemsPerPage = 10;

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
window.goToPage = function(pageNumber) {
  currentPage = pageNumber;
  populateOrdersTable(); // Reload the table with the new page
};
function updatePaginationControls(totalPages) {
  const paginationControls = $('#paginationControls');
  paginationControls.empty();

  // Previous button
  if (currentPage > 1) {
    paginationControls.append(`<button class="btn btn-primary mx-1" onclick="goToPage(${currentPage - 1})">Previous</button>`);
  }

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    paginationControls.append(`<button class="mx-1 btn ${i === currentPage ? 'btn-secondary' : 'btn-primary'}" onclick="goToPage(${i})">${i}</button>`);
  }

  // Next button
  if (currentPage < totalPages) {
    paginationControls.append(`<button class="btn btn-primary mx-1" onclick="goToPage(${currentPage + 1})">Next</button>`);
  }
}

async function populateOrdersTable() {
  const ordersListTableBody = document.querySelector('#ordersListTable tbody');
  const orders = [];

  try {
    const querySnapshot = await getDocs(collection(db, "Orders"));
    for (const doc of querySnapshot.docs) {
      const orderData = doc.data();
      orders.push({
        id: doc.id,
        ...orderData
      });
    }

    // Calculate total pages
    const totalPages = Math.ceil(orders.length / itemsPerPage);
    
    // Slice the orders list to get only the items for the current page
    const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Clear the table before appending new rows
    ordersListTableBody.innerHTML = '';

    for (const order of paginatedOrders) {
      console.log("Order Data:", order);
      console.log("CreatedAt Value:", order.createdAt);
      console.log("CreatedAt Type:", typeof order.createdAt);
      console.log("CreatedAt Methods:", Object.keys(order.createdAt));
      const orderStatus = order.status || "Unknown";
      const createdAt = order.createdAt;
    
      // 🛠 Ensure createdAt exists before calling toDate()
     
      let timestamp = "N/A";
      if (order.createdAt && typeof order.createdAt.toDate === 'function') {
        const date = order.createdAt.toDate(); // Firestore Timestamp case
        timestamp = `${date.toLocaleDateString()} (${date.toLocaleTimeString()})`;
      } else if (order.createdAt?.seconds) {
        const date = new Date(order.createdAt.seconds * 1000); // { seconds, nanoseconds } case
        timestamp = `${date.toLocaleDateString()} (${date.toLocaleTimeString()})`;
      } else {
        console.warn(`Order ${order.orderId} has an invalid createdAt:`, order.createdAt);
      }
      
    
      const userId = order.orderedBy || "Unknown";
      const fullname = await getUserName(userId);
      const productUrl = `order-single.html?code=${order.orderId}`;
      const status = orderStatus === "Processing" ? "bg-warning" :
                     orderStatus === "Success" ? "bg-primary" : "bg-danger";
    
      // 🛠 Ensure order.items is an array before looping
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="orderOne"/>
                <label class="form-check-label" for="orderOne"></label>
              </div>
            </td>
            <td>
              <a href="#!"><img src="${item.imageUrl}" alt="" class="icon-shape icon-md"/></a>
            </td>
            <td><a href="${productUrl}" class="text-reset">${order.orderId}</a></td>
            <td>${fullname}</td>
            <td>${timestamp}</td>
            <td>MoMo</td>
            <td><span class="${status} text-white" id="orderStatus">${orderStatus}</span></td>
            <td>¢ ${FormatTotal(item.price)}</td>
          `;
          ordersListTableBody.appendChild(row);
        });
      } else {
        console.warn(`Order ${order.orderId} has no items or items is not an array:`, order.items);
      }
    }
    
    
    

    // Update pagination controls
    updatePaginationControls(totalPages);

  } catch (error) {
    console.error("Error fetching orders: ", error.message);
    alert("Error fetching Orders: " + error.message);
    
  }
}



// window.onload = () => {
//     populateOrdersTable();
   
//   };
document.addEventListener("DOMContentLoaded", () => {
  populateOrdersTable();
});
  function FormatTotal(amount) {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

 
  function updateOrderStatusElement(status) {
    const orderStatusElement = document.getElementById("orderStatus");
  
    // Remove any existing status classes
    orderStatusElement.classList.remove("bg-success", "bg-warning", "bg-danger", "text-success", "text-warning", "text-danger");
  
    // Add new classes based on the status
    switch (status) {
      case "Success":
        orderStatusElement.classList.add("bg-success", "text-white");
        break;
      case "Pending":
        orderStatusElement.classList.add("bg-warning", "text-warning");
        break;
      case "Canceled":
        orderStatusElement.classList.add("bg-danger", "text-white");
        break;
      default:
        break;
    }
  
    // Set the status text
    orderStatusElement.innerHTML = status;
  }