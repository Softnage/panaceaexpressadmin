import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, addDoc,getDoc,getDocs ,serverTimestamp,where ,query   } 
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
  const storage = getStorage(app);
  const auth = getAuth(app);
  const user = auth.currentUser;

  async function getUserName(userid) {
    let fullname = "";
    try {
      const customerReg = collection(db, "Users");
      const q = query(customerReg, where("uid", "==", userid));
      const querySnapshot = await getDocs(q);
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fullname = `${data.fullName}`;
      });
    } catch (error) {
      console.error("Error fetching User: ", error);
      alert("Error fetching User: " + error.message);
    }
    return fullname;
  }

  async function AddBlog(userID)
{    
  const title = document.getElementById("blogTitle").value;
  const description = document.getElementById("editor").innerHTML;
  const spinner = document.getElementById("prodspinner");
  const userName = await getUserName(userID);

   // Handle image upload
   const imageChooser = document.getElementById("imageChooser");
   const file = imageChooser.files[0];
   let imageUrl = "";


   if (file && file.type.startsWith("image/")) {
      document.getElementById("addBtn").disabled  = true;
      spinner.style.display = "block"; // Show spinner
      try {
        // Upload image to Firebase Storage
        const storageRef = ref(storage, `Blog/${file.name}`);
        await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(storageRef);
      } catch (error) {
        console.error("Error uploading image: ", error);
        alert("Error uploading image: " + error.message);
        return;
      }
    }
    try {
      await addDoc(collection(db, "Blogs"), {
          title: title,
          description: description,
          blogImage: imageUrl,
          createdAt: new Date(),
          createdBy: userName,
          postTimestamp: serverTimestamp()

      });
    } catch (error) {
      console.error("Error adding blog: ", error);
      alert("Error adding blog: " + error.message);
    }finally {
      spinner.style.display = "none"; // Hide spinner
      document.getElementById("addBtn").disabled  = false;
      
    }
   
}


async function AddCarrer()
{
  const quill = new Quill('#editor', { theme: 'snow' });
  const title = document.getElementById("careerTitle").value; 
  const salary = document.getElementById("careerSalary").value; 
  const qualification = document.getElementById("careerQualification").value; 
  const description = document.querySelector(".careerDetails").innerHTML;
  const spinner = document.getElementById("careerspinner");
  const delta = quill.getContents();
  console.log(delta);
  const html = quill.getSemanticHTML(0, 10);
  try {
    spinner.style.display = "block"; // Show spinner
    await addDoc(collection(db, "Careers"), {
        title: title,
        description: html,
        salary: salary,
        createdAt: new Date(),
        qualifications: qualification,
        postTimestamp: serverTimestamp()

    });
  } catch (error) {
    console.error("Error adding blog: ", error);
    alert("Error adding blog: " + error.message);
  }finally {
    spinner.innerHTML = "Competed Succefully"; // Hide spinner
    document.getElementById("careerAddBtn").disabled  = false;
    
  }
}
$("#addBtn").click(function(){
    onAuthStateChanged(auth, (user) => {
        if (user) {
         AddBlog(user.uid)
          // ...
        } else {
            console.log("Not Logged In");
        }
      });
})
$("#careerAddBtn").click(function(){
 AddCarrer();
});