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
    
        document.getElementById('navOverlay').style.display = 'none';
        document.getElementById('navOverlayMobile').style.display = 'none';
     }else if(userrole =="Updater")
     {
        UpdaterPermissions();
        document.getElementById('navOverlay').style.display = 'none';
        document.getElementById('navOverlayMobile').style.display = 'none';
     }else{
        //Admin full previlages
        document.getElementById('navOverlay').style.display = 'none';
        document.getElementById('navOverlayMobile').style.display = 'none';
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
        $("#profileEmail").html(data.email);
        $("#profileUserName").html(data.fullName);
      });
    } catch (error) {
      console.error("Error fetching customer: ", error);
      alert("Error fetching customer: " + error.message);
    }
    return userrole;
  }

  function UpdaterPermissions()
  {
    $(".permissionSales").hide();
    $(".permissionAddApp").hide();
    $(".permissionAddApp2").hide();
    $(".permissionUsers").hide();
    $(".permissionReports").hide();
    $(".permissionBlog").hide();
    $(".permissionCareers").hide();
   $("#earnings").hide();
  $(".revenue").hide();
   $(".salesoverview").hide();
    $(".orders").hide();
  }
  function POSPermissions()
  {
    $(".earnings").hide();
    $(".revenue").hide();
    $(".permissionProducts").hide();
    $(".permissionAddApp").hide();
    $(".permissionAddApp2").hide();
    $(".permissionUsers").hide();
    $(".permissionReports").hide();
    $(".permissionBlog").hide();
    $(".permissionCareers").hide();
      $("#earnings").hide();
      $("#permissionReturns").hide();
      $(".revenue").hide();
      $(".salesoverview").hide();
      $(".addNewProdBtn").hide();
     
  }
  $("#signOut").on("click", function() {
    const auth = getAuth();
    signOut(auth).then(() => {
      window.location.href = "index.html";
    }).catch((error) => {
      console.error("Error fetching customer: ", error);
      alert("Error fetching customer: " + error.message);
    });
   });