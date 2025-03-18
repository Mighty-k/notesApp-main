// Handle Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
    
      if (response.ok) {
        console.log(data)
        localStorage.setItem('jwt', data.token);
        localStorage.setItem('username', data.user.name);
        
        window.location.href = 'notes.html';
      } else {
        alert(data.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login.');
    }
  });
}

// Handle Signup
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Signup successful! Please log in.');
        window.location.href = 'index.html';
      } else {
        alert(data.message || 'Signup failed.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred during signup.');
    }
  });
}

// Check Authentication on Notes Page
const token = localStorage.getItem('jwt');
if (!token && window.location.pathname.includes('notes.html')) {
  alert('You must log in first.');
  window.location.href = 'index.html';
}

// Display Username in Navbar
const usernameElement = document.querySelector('.username');
if (usernameElement) {
  const username = localStorage.getItem('username');
  if (username) {
    usernameElement.textContent = username;
  }
}

// Logout Functionality
const logoutButton = document.querySelector('.logout-btn');
if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
  });
}

// Notes Functionality
const addNoteButton = document.querySelector('.add-note');
const modal = document.querySelector('.modal');
const closeModalButton = document.querySelector('.close-modal');
const noteForm = document.querySelector('#noteForm');
const notesContainer = document.querySelector('.notes-container');
const noNotesText = document.querySelector('.no-notes');
const viewNote = document.querySelector('#view-note');
const editForm = document.getElementById('editNoteForm')
const closeNote = document.querySelector('#close-note');

const date = new Date().toLocaleString()


function truncateText(text, maxLength) {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

let isEditing = false;
let editingNote = null;

// Fetch Notes
async function fetchNotes() {
  try {
    const response = await fetch('http://localhost:5000/api/notes', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const notes = await response.json();
      renderNotes(notes);
    } else {
      alert('Failed to fetch notes. Please log in again.');
      window.location.href = 'index.html';
    }
  } catch (error) {
    console.error('Error fetching notes:', error);
  }
}

// Render Notes
function renderNotes(notes) {
  notesContainer.innerHTML = '';
  if (notes.length === 0) {
    noNotesText.style.display = 'block';
  } else {
    noNotesText.style.display = 'none';
    notes.forEach((note) => {
      const noteCard = document.createElement('div');
      noteCard.classList.add('note-card');
      noteCard.dataset.title = note.title;  
      noteCard.dataset.content = note.content;
      noteCard.dataset.id = note._id;  
      console.log(note._id + 'wfwfew');
      
      noteCard.innerHTML = `
        <h3>${note.title}</h3>
        <p>${truncateText(note.content, 100)}</p>
        
         <footer>
         <div class="note-actions">
          <button id='delete-icon'>
          <i class="delete-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </i></button>
        </div>
         
         ${new Date(note.date).toLocaleDateString()}
         </footer>
      `;
      noteCard.addEventListener('click', (event) => {
        if (event.target.closest('#delete-icon')) {
          deleteNoteHandler(note._id);
          console.log('sggds'+note._id);
          
        } else {
          editNoteHandler(note);
         
          
        }
      });
      noteCard.querySelector('#delete-icon').addEventListener('click', () => deleteNoteHandler(note._id));
      notesContainer.appendChild(noteCard);
    });
  }
}

// Open Modal for Adding Notes
addNoteButton?.addEventListener('click', () => {
  modal.classList.remove('hidden');
  noteForm.reset();
  isEditing = false;
});

// Close Modal
closeModalButton?.addEventListener('click', () => {
  modal.classList.add('hidden');
  noteForm.reset();
  isEditing = false;
});
closeNote?.addEventListener('click', () => {
  viewNote.classList.add('hidden');
  editForm.reset();
  isEditing = false;
});

// Handle Add or Edit Note
noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.querySelector('#title').value.trim().toUpperCase();
  const content = document.querySelector('#content').value.trim();

  if (!title || !content) {
    alert('Both title and content are required!');
    return;
  }


  try {
  
      const response = await fetch('http://localhost:5000/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, date }),
      });

      if (response.ok) {
        alert('Note added successfully!');
      } else {
        alert('Failed to add note.');
      }
    
    fetchNotes();
  } catch (error) {
    console.error('Error saving note:', error);
  }

  modal.classList.add('hidden');
  noteForm.reset();
});

editForm.addEventListener('submit',async (e) => {
  e.preventDefault();
  let title = document.querySelector('#noteTitle').value.trim().toUpperCase();
  let content = document.querySelector('#noteContent').value.trim();
  if (!title || !content) {
    alert('Both title and content are required!');
    return;
  }
  if (title === editingNote.title && content === editingNote.content) {
    viewNote.classList.add('hidden'); 
    editForm.reset(); 
    isEditing = false;
    return;  
  }
 
  try{
   
      const response = await fetch(`http://localhost:5000/api/notes/${editingNote._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, date }),
      });

      if (response.ok) {
        alert('Note updated successfully!');
      } else {
        alert('Failed to update note.');
      }
    fetchNotes();
  }
  catch (error) {
    console.error('Error saving note:', error);
  }
  viewNote.classList.add('hidden');
  editForm.reset();
}
)

// Edit Note Handler
function editNoteHandler(note) {
  isEditing = true;
  editingNote = note;
  console.log("anoo "+ JSON.stringify(note));
  document.querySelector('#noteTitle').value = note.title;
  document.querySelector('#noteContent').value = note.content;
  viewNote.classList.remove('hidden');

  
}

// Delete Note Handler
async function deleteNoteHandler(noteId) {
  try {
    const response = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      alert('Note deleted successfully!');
      fetchNotes();
    } else {
      alert('Failed to delete note.');
    }
  } catch (error) {
    console.error('Error deleting note:', error);
  }
}

// Fetch Notes on Load
if (window.location.pathname.includes('notes.html')) {
  fetchNotes();
}

console.log('hi');
