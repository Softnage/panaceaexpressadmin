import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, addDoc,getDoc,getDocs ,serverTimestamp,where ,query, doc, updateDoc, deleteDoc   } 
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
      alert("Blog posted successfully!");
      
      // Clear the form
      document.getElementById("blogTitle").value = "";
      document.getElementById("editor").innerHTML = "";
      document.getElementById("imageChooser").value = "";
      document.getElementById("featuredImage").src = "assets/images/blogimgeholder.svg";
      
      // Refresh the blog management table
      loadBlogsForManagement();
      
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

// Blog Management Functions
let currentEditingBlogId = null;
let editQuill = null;

// Load all blogs for management
async function loadBlogsForManagement() {
  const blogsTableBody = document.getElementById('blogsTableBody');
  const blogsLoader = document.getElementById('blogsLoader');
  const blogsTableContainer = document.getElementById('blogsTableContainer');
  const emptyState = document.getElementById('emptyState');
  
  try {
    blogsLoader.style.display = 'block';
    blogsTableContainer.style.display = 'none';
    emptyState.style.display = 'none';

    const blogsCollection = collection(db, "Blogs");
    const querySnapshot = await getDocs(blogsCollection);
    
    if (querySnapshot.empty) {
      blogsLoader.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    blogsTableBody.innerHTML = '';
    
    querySnapshot.forEach((docSnapshot) => {
      const blog = docSnapshot.data();
      const blogId = docSnapshot.id;
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <img src="${blog.blogImage || 'assets/images/blogimgeholder.svg'}" 
               alt="Blog Image" class="img-thumbnail" style="width: 60px; height: 60px; object-fit: cover;">
        </td>
        <td>
          <div>
            <h6 class="mb-0">${blog.title || 'Untitled'}</h6>
            <small class="text-muted">${truncateText(blog.description || '', 100)}</small>
          </div>
        </td>
        <td>${blog.createdBy || 'Unknown'}</td>
        <td>${formatDate(blog.createdAt)}</td>
        <td>
          <span class="badge bg-success">Published</span>
        </td>
        <td>
          <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm btn-outline-primary" onclick="editBlog('${blogId}')" 
                    data-bs-toggle="tooltip" title="Edit">
              <i class="bi bi-pencil"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-info" onclick="viewBlog('${blogId}')" 
                    data-bs-toggle="tooltip" title="View">
              <i class="bi bi-eye"></i>
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteBlog('${blogId}', '${blog.title || 'Untitled'}')" 
                    data-bs-toggle="tooltip" title="Delete">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      `;
      blogsTableBody.appendChild(row);
    });

    blogsLoader.style.display = 'none';
    blogsTableContainer.style.display = 'block';
    
    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(tooltip => {
      new bootstrap.Tooltip(tooltip);
    });

  } catch (error) {
    console.error("Error loading blogs:", error);
    blogsLoader.style.display = 'none';
    emptyState.style.display = 'block';
  }
}

// Edit blog function
async function editBlog(blogId) {
  try {
    const blogDoc = await getDoc(doc(db, "Blogs", blogId));
    if (!blogDoc.exists()) {
      alert("Blog not found!");
      return;
    }

    const blog = blogDoc.data();
    currentEditingBlogId = blogId;

    // Populate edit form
    document.getElementById('editBlogTitle').value = blog.title || '';
    
    // Initialize Quill editor for editing if not already initialized
    if (!editQuill) {
      editQuill = new Quill('#editBlogContent', { 
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
          ]
        }
      });
    }
    
    // Set the content
    editQuill.root.innerHTML = blog.description || '';

    // Show current image
    const currentImagePreview = document.getElementById('currentImagePreview');
    if (blog.blogImage) {
      currentImagePreview.innerHTML = `
        <label class="form-label">Current Image:</label>
        <div>
          <img src="${blog.blogImage}" alt="Current blog image" class="img-thumbnail" style="max-width: 200px;">
        </div>
      `;
    } else {
      currentImagePreview.innerHTML = '<p class="text-muted">No current image</p>';
    }

    // Show modal
    const editModal = new bootstrap.Modal(document.getElementById('editBlogModal'));
    editModal.show();

  } catch (error) {
    console.error("Error loading blog for editing:", error);
    alert("Error loading blog: " + error.message);
  }
}

// Save edited blog
async function saveEditedBlog() {
  if (!currentEditingBlogId) return;

  const saveBtn = document.getElementById('saveEditBtn');
  const spinner = document.getElementById('editSpinner');
  
  try {
    saveBtn.disabled = true;
    spinner.style.display = 'inline-block';

    const title = document.getElementById('editBlogTitle').value;
    const description = editQuill.root.innerHTML;
    const imageFile = document.getElementById('editBlogImage').files[0];

    let updateData = {
      title: title,
      description: description,
      updatedAt: new Date()
    };

    // Handle new image upload if provided
    if (imageFile && imageFile.type.startsWith("image/")) {
      const storageRef = ref(storage, `Blog/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(storageRef);
      updateData.blogImage = imageUrl;
    }

    // Update the document
    await updateDoc(doc(db, "Blogs", currentEditingBlogId), updateData);

    // Close modal and refresh table
    bootstrap.Modal.getInstance(document.getElementById('editBlogModal')).hide();
    loadBlogsForManagement();
    
    alert("Blog updated successfully!");

  } catch (error) {
    console.error("Error updating blog:", error);
    alert("Error updating blog: " + error.message);
  } finally {
    saveBtn.disabled = false;
    spinner.style.display = 'none';
  }
}

// Delete blog function
function deleteBlog(blogId, blogTitle) {
  currentEditingBlogId = blogId;
  document.getElementById('deleteBlogTitle').textContent = blogTitle;
  
  const deleteModal = new bootstrap.Modal(document.getElementById('deleteBlogModal'));
  deleteModal.show();
}

// Confirm delete blog
async function confirmDeleteBlog() {
  if (!currentEditingBlogId) return;

  const deleteBtn = document.getElementById('confirmDeleteBtn');
  const spinner = document.getElementById('deleteSpinner');
  
  try {
    deleteBtn.disabled = true;
    spinner.style.display = 'inline-block';

    await deleteDoc(doc(db, "Blogs", currentEditingBlogId));

    // Close modal and refresh table
    bootstrap.Modal.getInstance(document.getElementById('deleteBlogModal')).hide();
    loadBlogsForManagement();
    
    alert("Blog deleted successfully!");

  } catch (error) {
    console.error("Error deleting blog:", error);
    alert("Error deleting blog: " + error.message);
  } finally {
    deleteBtn.disabled = false;
    spinner.style.display = 'none';
  }
}

// View blog function (could open in new tab or modal)
function viewBlog(blogId) {
  // For now, just alert - you could implement a preview modal
  alert("View blog functionality - could open preview in modal or new tab");
}

// Utility functions
function truncateText(text, maxLength) {
  if (!text) return '';
  const stripped = text.replace(/<[^>]*>/g, ''); // Remove HTML tags
  return stripped.length > maxLength ? stripped.substring(0, maxLength) + '...' : stripped;
}

function formatDate(date) {
  if (!date) return 'N/A';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Search functionality
function setupBlogSearch() {
  const searchInput = document.getElementById('blogSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
      const tableRows = document.querySelectorAll('#blogsTableBody tr');
      
      tableRows.forEach(row => {
        const title = row.cells[1].textContent.toLowerCase();
        const author = row.cells[2].textContent.toLowerCase();
        
        if (title.includes(searchTerm) || author.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }
}

// Make functions globally accessible
window.editBlog = editBlog;
window.deleteBlog = deleteBlog;
window.viewBlog = viewBlog;

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Load blogs when page loads
  loadBlogsForManagement();
  setupBlogSearch();
  
  // Save edit button click handler
  const saveEditBtn = document.getElementById('saveEditBtn');
  if (saveEditBtn) {
    saveEditBtn.addEventListener('click', saveEditedBlog);
  }
  
  // Confirm delete button click handler
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', confirmDeleteBlog);
  }
  
  // Image preview for new blog
  const imageChooser = document.getElementById('imageChooser');
  const featuredImage = document.getElementById('featuredImage');
  
  if (imageChooser && featuredImage) {
    imageChooser.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
          featuredImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }
});