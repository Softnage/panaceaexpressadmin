// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  collection,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  doc,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVRG9BKj8af4h0abdjz8Tab4pQRq0wzjM",
  authDomain: "panacea-admin.firebaseapp.com",
  projectId: "panacea-admin",
  storageBucket: "panacea-admin.appspot.com",
  messagingSenderId: "800826664196",
  appId: "1:800826664196:web:df61636a3b5a44bf6bdc51",
};

$("#saveBtn").click(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const orderCode = urlParams.get("code");
  const selectedOpt = $("#statusOption").val();
  if (selectedOpt == "Status") {
    alert("Choose an Option");
  } else {
    updateOrderStatus(orderCode, selectedOpt);
  }
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const user = auth.currentUser;

async function getUserName(userid) {
  let fullname = "";
  try {
    const customerReg = collection(db, "Customers");
    const q = query(customerReg, where("userID", "==", userid));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      fullname = `${data.firstname} ${data.lastname}`;
      $("#cName").html(fullname);
      $("#cEmail").html(data.email);
      $("#cPhone").html(data.phonenumber);
    });
  } catch (error) {
    console.error("Error fetching customer: ", error);
    alert("Error fetching customer: " + error.message);
  }
  return fullname;
}

async function loadAddresses(userID) {
  try {
    const customerRef = collection(db, "Customers");
    const q = query(customerRef, where("userID", "==", userID));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const customerDoc = querySnapshot.docs[0];
      const addressesRef = collection(customerDoc.ref, "Addresses");
      const addressDoc = await getDoc(doc(addressesRef, userID));

      if (addressDoc.exists()) {
        const addressData = addressDoc.data();
        console.log("My address: " + addressData.address);
        $("#addressName").html(addressData.name);
        $("#addressLoc").html(addressData.address);
        $("#addressCity").html(addressData.city);
      } else {
        console.error("No address found for the given userID");
      }
    } else {
      console.error("No customer found with the given userID " + userID);
    }
  } catch (error) {
    console.error("Error fetching addresses: ", error);
  }
}

window.onload = () => {
  populateOrdersTable();
};

function FormatTotal(amount) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
async function populateOrdersTable() {
  const ordersListTableBody = document.querySelector("#ordersListTable tbody");
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const orderCode = urlParams.get("code");
    const ordersCollection = collection(db, "Orders");
    const q = query(ordersCollection, where("orderId", "==", orderCode));
    const querySnapshot = await getDocs(q);

    for (const doc of querySnapshot.docs) {
      const orders = doc.data();
      const userId = orders.orderedBy;
      const fullname = await getUserName(userId);
      $("#orderID").html("Order ID: #" + orders.orderId);
      let total = 0;
      let cost = 0;
      // Load delivery address from order document instead of separate collection
      if (orders.deliveryAddress) {
        $("#addressName").html(orders.deliveryAddress.name || "N/A");
        $("#addressLoc").html(orders.deliveryAddress.address || "N/A");
        $("#addressPhone").html(orders.deliveryAddress.phone || "N/A");
        // If there's a city field in the HTML, update it with landmark
        if ($("#addressCity").length) {
          $("#addressCity").html(orders.deliveryAddress.landmark || "N/A");
        }
      }
      const createdAt = orders.createdAt;
      const date = createdAt.toDate();
      const formattedDate = date.toLocaleDateString(); // e.g., "MM/DD/YYYY"
      $("#oID").html("#" + orders.orderId);
      $("#orderDate").html(formattedDate);
      $("#orderTotal").html("GHS " + orders.totalAmount.toFixed(2));
      $("#orderStatus").html(orders.status);
      updateOrderStatusElement(orders.status);
      orders.items.forEach((item) => {
        let itemPrice = Number(item.price) || 0; // Ensure it's a number
        const itemTotal = itemPrice * item.quantity;
        total += itemTotal;
        cost = itemPrice;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <a href="#" class="text-inherit">
                    <div class="d-flex align-items-center">
                        <div>
                            <img src="${
                              item.imageUrl
                            }" alt="" class="icon-shape icon-lg"/>
                        </div>
                        <div class="ms-lg-4 mt-2 mt-lg-0">
                            <h5 class="mb-0 h6">${item.title}</h5>
                        </div>
                    </div>
                </a>
            </td>
            <td><span class="text-body">¢ ${itemPrice.toFixed(2)}</span></td>
            <td>${item.quantity}</td>
            <td>¢ ${itemTotal.toFixed(2)}</td>
        `;
        ordersListTableBody.appendChild(row);
      });

      // Append subtotal, shipping, and grand total rows
      const subtotalRow = document.createElement("tr");
      subtotalRow.innerHTML = `
          <td class="border-bottom-0 pb-0"></td>
          <td class="border-bottom-0 pb-0"></td>
          <td colspan="1" class="fw-medium text-dark">Sub Total :</td>
          <td class="fw-medium text-dark">¢ ${orders.totalAmount.toFixed(
            2
          )}</td>
        `;
      ordersListTableBody.appendChild(subtotalRow);

      const shippingCost = parseFloat(orders.shipping);
      const shippingRow = document.createElement("tr");
      shippingRow.innerHTML = `
          <td class="border-bottom-0 pb-0"></td>
          <td class="border-bottom-0 pb-0"></td>
          <td colspan="1" class="fw-medium text-dark">Shipping Cost</td>
          <td class="fw-medium text-dark">¢ ${shippingCost.toFixed(2)}</td>
        `;
      ordersListTableBody.appendChild(shippingRow);

      const grandTotal = total + shippingCost;
      const grandTotalRow = document.createElement("tr");
      grandTotalRow.innerHTML = `
          <td></td>
          <td></td>
          <td colspan="1" class="fw-semibold text-dark">Grand Total</td>
          <td class="fw-semibold text-dark">¢ ${grandTotal.toFixed(2)}</td>
        `;
      ordersListTableBody.appendChild(grandTotalRow);
    }
  } catch (error) {
    console.error("Error fetching orders: ", error);
    alert("Error fetching Orders: " + error.message);
  }
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    // Prompt for delivery fee
    let shippingFee = prompt(
      "How much was the agreed delivery fee? (Enter amount in GHS)",
      ""
    );
    if (shippingFee === null) {
      // User cancelled prompt
      return;
    }
    shippingFee = shippingFee.trim();
    if (!shippingFee || isNaN(shippingFee) || Number(shippingFee) < 0) {
      alert("Please enter a valid delivery fee amount.");
      return;
    }

    // Prompt for delivery branch
    let deliveryBranch = prompt(
      "Which branch will handle the delivery? (e.g., Accra Main, Kumasi, Takoradi)",
      ""
    );
    if (deliveryBranch === null) {
      // User cancelled prompt
      return;
    }
    deliveryBranch = deliveryBranch.trim();
    if (!deliveryBranch) {
      alert("Please enter a valid branch name.");
      return;
    }

    const ordersRef = collection(db, "Orders");
    const q = query(ordersRef, where("orderId", "==", orderId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Assuming orderId is unique and there's only one document to update
      const orderDoc = querySnapshot.docs[0];
      const orderDocRef = doc(db, "Orders", orderDoc.id);

      await updateDoc(orderDocRef, {
        status: newStatus,
        shipping: Number(shippingFee),
        deliveryBranch: deliveryBranch,
      });

      alert(`Order status, delivery fee, and delivery branch updated successfully.\nBranch: ${deliveryBranch}\nFee: GHS ${shippingFee}`);
      // Format phone number properly for SMS
      let phoneNumber = orderDoc.data().deliveryAddress?.phone;
      if (phoneNumber) {
        // Remove leading zero if present and add country code
        if (phoneNumber.startsWith('0')) {
          phoneNumber = '233' + phoneNumber.substring(1);
        } else if (!phoneNumber.startsWith('233')) {
          phoneNumber = '233' + phoneNumber;
        }
      } else {
        phoneNumber = "N/A";
      }
      
      SendSMS(
        orderId,
        orderDoc.data().totalAmount,
        phoneNumber
      );
      updateOrderStatusElement(newStatus);
    } else {
      alert("No order found with the given orderId");
    }
  } catch (error) {
    alert("Error updating order status: " + error.message);
  }
}
async function SendSMS(orderId, total,destination) {
  // Validate phone number before sending SMS
  if (!destination || destination === "N/A" || destination.length < 10) {
    console.error("❌ Invalid phone number for SMS:", destination);
    alert("Cannot send SMS - Invalid phone number in delivery address");
    return;
  }

  const baseURL = "https://adminapi.edugh.net/api/v1/sms/send";

  const source = "Panacea";
  const school_id = "29";
  const adminPhone = "233542423472";
  const apiKey = "jy4ExUFh31VEup8IGkhuCdxls212TIVch0QOUv6Yw2C1r";

  // Compose your SMS message
  const message = `Your Order #${orderId} of total GHS ${total} has been received successfully.A representative will get in touch with you.You can also call us on ${adminPhone} Thank you!`;

  // Build query parameters
  const params = new URLSearchParams({
    message: message,
    destination: destination,
    source: source,
    school_id: school_id,
    api_key: apiKey,
  });

  const apiURL = `${baseURL}?${params.toString()}`;

  try {
    // Send GET request with parameters in URL
    const response = await fetch(apiURL, { method: "GET" });

    const text = await response.text();

    if (!response.ok) {
      console.error("❌ Failed to send SMS. Status:", response.status);
      console.error("Response:", text);
      return;
    }

    // Try parsing JSON if response is valid
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      console.log("ℹ️ Non-JSON response:", text);
      return;
    }

    console.log(`✅ SMS sent successfully to ${destination}:`, result);
  } catch (error) {
    console.error("⚠️ Error sending SMS:", error);
  }
}
function updateOrderStatusElement(status) {
  const orderStatusElement = document.getElementById("orderStatus");

  // Remove any existing status classes
  orderStatusElement.classList.remove(
    "bg-success",
    "bg-warning",
    "bg-danger",
    "text-success",
    "text-warning",
    "text-danger"
  );

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

$("#downloadInvoice").click(function () {
  downloadInvoice();
});
function downloadInvoice() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderCode = urlParams.get("code");

  const img = document.createElement("img");
  img.src = "Assets/images/logos/site-logo2.png"; // Set your image source
  img.style.width = "100px"; // Set the width of the image
  img.style.height = "auto"; // Set the height of the image
  img.style.marginBottom = "20px"; // Add some margin if needed

  // Add the image to the invoice
  const invoice = document.getElementById("invoice");
  invoice.insertBefore(img, invoice.firstChild);

  // Store elements to be removed
  const elementsToHide = document.querySelectorAll(".hide-on-pdf");
  const removedElements = [];

  elementsToHide.forEach((el) => {
    removedElements.push(el);
    el.parentNode.removeChild(el);
  });

  const element = document.getElementById("invoice");
  const opt = {
    margin: 0.5,
    filename: orderCode + "invoice.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  };

  html2pdf()
    .from(element)
    .set(opt)
    .save()
    .then(() => {
      // Restore removed elements
      removedElements.forEach((el) => document.body.appendChild(el));
      invoice.removeChild(img);
    });
}
