import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp, deleteDoc, doc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
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
  async function getUserPhone(userid) {
    let phonenumber = "";
    try {
      const customerReg = collection(db, "Customers");
      const q = query(customerReg, where("userID", "==", userid));
      const querySnapshot = await getDocs(q);
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        phonenumber = data.phonenumber;
      });
    } catch (error) {
      console.error("Error fetching customer: ", error);
      alert("Error fetching customer: " + error.message);
    }
    return phonenumber;
  }
  const spinner = document.getElementById("prodspinner");

  function formatDate(date) {
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
  }
  async function getPrescription() {
    const prescriptionsTable = document.querySelector('#prescriptionsTable tbody');
    try {
        const prescriptionsRef = collection(db, "Prescriptions");
        const q = query(prescriptionsRef, orderBy("createdAt", "desc")); // desc for newest first
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (doc) => {
            const prescription = doc.data();
            const fullname = await getUserName(prescription.user);
            const phonenumber = await getUserPhone(prescription.user);
            const message = prescription.message;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="" id="productCode${doc.id}" />
                        <label class="form-check-label" for="productCode${doc.id}"></label>
                    </div>
                </td>
                <td>
                    <a href="#!">
                        <img src="${prescription.fileURL}" alt="" class="icon-shape icon-md" />
                    </a>
                </td>
                <td>${fullname}</td>
               <td>${formatDate(prescription.createdAt.toDate())}</td>
                <td><i class="bi bi-eye text-success" data-id="${doc.id}" data-fullname="${fullname}" data-message="${message}" data-fileurl="${prescription.fileURL}" data-phone="${phonenumber}"></i></td>
            `;
            prescriptionsTable.appendChild(row);
        });
         // Add event listener for the eye icons
         prescriptionsTable.addEventListener('click', function(event) {
            if (event.target.classList.contains('bi-eye')) {
                const eyeIcon = event.target;
                const modalImage = document.getElementById('modalImage');
                const modalFullName = document.getElementById('modalFullName');
                const modalMessage = document.getElementById('modalMessage');
                
                // Get data attributes from the clicked icon
                const fileURL = eyeIcon.getAttribute('data-fileurl');
                const fullName = eyeIcon.getAttribute('data-fullname');
                const phonenumber = eyeIcon.getAttribute('data-phone');
                const message = eyeIcon.getAttribute('data-message');
                
                // Populate the modal with the details
                modalImage.src = fileURL;
                modalFullName.textContent = fullName;
                modalMessage.textContent = message + " | User Contact " + phonenumber;
                
                // Show the modal
                const detailsModal = new bootstrap.Modal(document.getElementById('detailsModal'));
                detailsModal.show();
            }
        });
    }catch(error){
        console.error("Error fetching products: ", error);
        alert("Error fetching products: " + error.message);
    }
  }
  $('#downloadButton').click(function(){
    var imgURL = $('#modalImage').attr('src');
    var a = document.createElement('a');
    a.href = imgURL;
    a.download = imgURL.split('/').pop();  // Extracts the file name from the URL
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});
  window.onload = () => {
    getPrescription();
  }