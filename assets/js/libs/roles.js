import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection,query,where,getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getAuth,onAuthStateChanged ,signOut  } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

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

onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userid = user.uid;
      const userrole = await getUserRole(userid);
     if(userrole == "Sales Personnel")
     {
        POSPermissions();
        const navOverlay = document.getElementById('navOverlay');
        const navOverlayMobile = document.getElementById('navOverlayMobile');
        if(navOverlay) navOverlay.style.display = 'none';
        if(navOverlayMobile) navOverlayMobile.style.display = 'none';
     }else if(userrole =="Updater")
     {
        UpdaterPermissions();
        const navOverlay = document.getElementById('navOverlay');
        const navOverlayMobile = document.getElementById('navOverlayMobile');
        if(navOverlay) navOverlay.style.display = 'none';
        if(navOverlayMobile) navOverlayMobile.style.display = 'none';
     }else{
        //Admin full previlages
        const navOverlay = document.getElementById('navOverlay');
        const navOverlayMobile = document.getElementById('navOverlayMobile');
        if(navOverlay) navOverlay.style.display = 'none';
        if(navOverlayMobile) navOverlayMobile.style.display = 'none';
     }
    } else {
      // User is signed out
      console.log("Not logged in");
    }
  });



  async function getUserRole(userid) {
    let userrole = "";
    try {
      const customerReg = collection(db, "Users");
      const q = query(customerReg, where("uid", "==", userid));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userrole = data.role;
        
        // Use vanilla JavaScript instead of jQuery for compatibility
        const profileEmail = document.getElementById("profileEmail");
        const profileUserName = document.getElementById("profileUserName");
        
        if (profileEmail) profileEmail.innerHTML = data.email;
        if (profileUserName) profileUserName.innerHTML = data.fullName;
      });
    } catch (error) {
      console.error("Error fetching customer: ", error);
      alert("Error fetching customer: " + error.message);
    }
    return userrole;
  }

  // Helper functions to replace jQuery
  function hideElementsByClass(className) {
    const elements = document.querySelectorAll('.' + className);
    elements.forEach(element => element.style.display = 'none');
  }
  
  function hideElementById(id) {
    const element = document.getElementById(id);
    if (element) element.style.display = 'none';
  }

  function UpdaterPermissions()
  {
    hideElementsByClass("permissionSales");
    hideElementsByClass("permissionAddApp");
    hideElementsByClass("permissionAddApp2");
    hideElementsByClass("permissionUsers");
    hideElementsByClass("permissionReports");
    hideElementsByClass("permissionBlog");
    hideElementsByClass("permissionCareers");
    hideElementById("earnings");
    hideElementsByClass("revenue");
    hideElementsByClass("salesoverview");
    hideElementsByClass("orders");
  }
  
  function POSPermissions()
  {
    hideElementsByClass("earnings");
    hideElementsByClass("revenue");
    hideElementsByClass("permissionProducts");
    hideElementsByClass("permissionAddApp");
    hideElementsByClass("permissionAddApp2");
    hideElementsByClass("permissionUsers");
    hideElementsByClass("permissionReports");
    hideElementsByClass("permissionBlog");
    hideElementsByClass("permissionCareers");
    hideElementById("earnings");
    hideElementById("permissionReturns");
    hideElementsByClass("revenue");
    hideElementsByClass("salesoverview");
    hideElementsByClass("addNewProdBtn");
  }

  // Sign out functionality
  const signOutBtn = document.getElementById("signOut");
  if (signOutBtn) {
    signOutBtn.addEventListener("click", function() {
      signOut(auth).then(() => {
        window.location.href = "index.html";
      }).catch((error) => {
        console.error("Error signing out: ", error);
        alert("Error signing out: " + error.message);
      });
    });
  }