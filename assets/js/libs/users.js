// User Management Module
import { 
    getFirestore, 
    collection, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { 
    getAuth, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { app, auth, db } from './main.js';

let currentUser = null;
let currentUserRole = null;
let allUsers = [];

// Initialize user management
export function initializeUserManagement() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            // Get current user's role from Firestore
            await getCurrentUserRole();
            // Load all users
            await loadUsers();
            // Setup event listeners
            setupEventListeners();
        } else {
            window.location.href = 'index.html';
        }
    });
}

// Get current user's role from Firestore
async function getCurrentUserRole() {
    try {
        const usersRef = collection(db, 'Users');
        const usersSnapshot = await getDocs(usersRef);
        
        usersSnapshot.forEach((doc) => {
            if (doc.id === currentUser.uid) {
                currentUserRole = doc.data().role;
            }
        });
    } catch (error) {
        console.error('Error getting current user role:', error);
    }
}

// Load all users from Firestore
export async function loadUsers() {
    const loader = document.getElementById('usersLoader');
    const tableContainer = document.getElementById('usersTableContainer');
    const emptyState = document.getElementById('emptyUsersState');
    
    try {
        // Show loader
        loader.style.display = 'block';
        tableContainer.style.display = 'none';
        emptyState.style.display = 'none';
        
        const usersRef = collection(db, 'Users');
        const q = query(usersRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        allUsers = [];
        querySnapshot.forEach((doc) => {
            allUsers.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Hide loader and show appropriate content
        loader.style.display = 'none';
        
        if (allUsers.length > 0) {
            renderUsersTable(allUsers);
            tableContainer.style.display = 'block';
        } else {
            emptyState.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error loading users:', error);
        loader.style.display = 'none';
        showAlert('Error loading users. Please try again.', 'danger');
    }
}

// Render users table
function renderUsersTable(users) {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    users.forEach((user) => {
        const row = document.createElement('tr');
        
        // Format created date
        const createdDate = user.createdAt ? 
            new Date(user.createdAt.toDate()).toLocaleDateString() : 
            'N/A';
        
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar avatar-xs me-2">
                        <span class="avatar-initials rounded-circle bg-light-primary text-dark-primary">
                            ${user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                        </span>
                    </div>
                    <div>
                        <h6 class="mb-0">${user.fullName || 'N/A'}</h6>
                    </div>
                </div>
            </td>
            <td>${user.email || 'N/A'}</td>
            <td>
                <span class="badge ${getRoleBadgeClass(user.role)}">
                    ${user.role || 'N/A'}
                </span>
            </td>
            <td>${createdDate}</td>
            <td>
                ${generateActionButtons(user)}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Get role badge CSS class
function getRoleBadgeClass(role) {
    switch (role) {
        case 'Admin':
            return 'bg-light-danger text-dark-danger';
        case 'Sales Personnel':
            return 'bg-light-success text-dark-success';
        case 'Updater':
            return 'bg-light-warning text-dark-warning';
        default:
            return 'bg-light-secondary text-dark-secondary';
    }
}

// Generate action buttons based on user role
function generateActionButtons(user) {
    // Only Admin users can see edit/delete actions
    if (currentUserRole !== 'Admin') {
        return '<span class="text-muted">No actions</span>';
    }
    
    // Don't allow admin to delete themselves
    const deleteButton = user.id === currentUser.uid ? '' : `
        <button class="btn btn-sm btn-outline-danger ms-1" 
                onclick="openDeleteUserModal('${user.id}', '${user.fullName}', '${user.email}')"
                title="Delete User">
            <i class="bi bi-trash"></i>
        </button>
    `;
    
    return `
        <div class="btn-group" role="group">
            <button class="btn btn-sm btn-outline-primary" 
                    onclick="openEditUserModal('${user.id}')"
                    title="Edit User">
                <i class="bi bi-pencil"></i>
            </button>
            ${deleteButton}
        </div>
    `;
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('userSearch');
    if (searchInput) {
        searchInput.addEventListener('input', handleUserSearch);
    }
    
    // Edit user form submit
    const saveEditBtn = document.getElementById('saveEditUserBtn');
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', handleEditUser);
    }
    
    // Delete user confirmation
    const confirmDeleteBtn = document.getElementById('confirmDeleteUserBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', handleDeleteUser);
    }
}

// Handle user search
function handleUserSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderUsersTable(allUsers);
        return;
    }
    
    const filteredUsers = allUsers.filter(user => 
        (user.fullName && user.fullName.toLowerCase().includes(searchTerm)) ||
        (user.email && user.email.toLowerCase().includes(searchTerm)) ||
        (user.role && user.role.toLowerCase().includes(searchTerm))
    );
    
    renderUsersTable(filteredUsers);
}

// Open edit user modal
window.openEditUserModal = function(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    // Populate form fields
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserFullName').value = user.fullName || '';
    document.getElementById('editUserEmail').value = user.email || '';
    document.getElementById('editUserRole').value = user.role || '';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
    modal.show();
};

// Handle edit user
async function handleEditUser() {
    const userId = document.getElementById('editUserId').value;
    const fullName = document.getElementById('editUserFullName').value.trim();
    const email = document.getElementById('editUserEmail').value.trim();
    const role = document.getElementById('editUserRole').value;
    
    if (!fullName || !email || !role) {
        showAlert('Please fill in all required fields.', 'warning');
        return;
    }
    
    const spinner = document.getElementById('editUserSpinner');
    const saveBtn = document.getElementById('saveEditUserBtn');
    
    try {
        // Show loading state
        spinner.style.display = 'inline-block';
        saveBtn.disabled = true;
        
        const userRef = doc(db, 'Users', userId);
        await updateDoc(userRef, {
            fullName: fullName,
            email: email,
            role: role,
            updatedAt: Timestamp.now()
        });
        
        // Hide modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
        modal.hide();
        
        // Reload users
        await loadUsers();
        
        showAlert('User updated successfully!', 'success');
        
    } catch (error) {
        console.error('Error updating user:', error);
        showAlert('Error updating user. Please try again.', 'danger');
    } finally {
        // Hide loading state
        spinner.style.display = 'none';
        saveBtn.disabled = false;
    }
}

// Open delete user modal
window.openDeleteUserModal = function(userId, userName, userEmail) {
    document.getElementById('deleteUserName').textContent = userName || 'N/A';
    document.getElementById('deleteUserEmail').textContent = userEmail || 'N/A';
    document.getElementById('confirmDeleteUserBtn').setAttribute('data-user-id', userId);
    
    const modal = new bootstrap.Modal(document.getElementById('deleteUserModal'));
    modal.show();
};

// Handle delete user
async function handleDeleteUser() {
    const userId = document.getElementById('confirmDeleteUserBtn').getAttribute('data-user-id');
    const spinner = document.getElementById('deleteUserSpinner');
    const deleteBtn = document.getElementById('confirmDeleteUserBtn');
    
    try {
        // Show loading state
        spinner.style.display = 'inline-block';
        deleteBtn.disabled = true;
        
        const userRef = doc(db, 'Users', userId);
        await deleteDoc(userRef);
        
        // Hide modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteUserModal'));
        modal.hide();
        
        // Reload users
        await loadUsers();
        
        showAlert('User deleted successfully!', 'success');
        
    } catch (error) {
        console.error('Error deleting user:', error);
        showAlert('Error deleting user. Please try again.', 'danger');
    } finally {
        // Hide loading state
        spinner.style.display = 'none';
        deleteBtn.disabled = false;
    }
}

// Show alert message
function showAlert(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at top of main content
    const main = document.querySelector('main');
    if (main && main.firstChild) {
        main.insertBefore(alertDiv, main.firstChild);
    }
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv && alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeUserManagement();
});