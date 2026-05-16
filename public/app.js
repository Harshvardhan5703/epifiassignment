const appDiv = document.getElementById('app');
let token = localStorage.getItem('token');
let userEmail = localStorage.getItem('userEmail');

async function apiCall(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(endpoint, options);
    const data = res.status !== 204 ? await res.json() : null;
    
    if (!res.ok) {
        throw new Error(data.message || data.error || 'API Error');
    }
    return data;
}

function render() {
    if (!token) {
        renderAuth();
    } else {
        renderDashboard();
    }
}

function renderAuth() {
    appDiv.innerHTML = `
        <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border mt-10">
            <h2 class="text-2xl font-bold mb-6 text-center">Notes App</h2>
            <div id="error" class="hidden bg-red-100 text-red-700 p-3 rounded mb-4 text-sm"></div>
            <input type="email" id="email" placeholder="Email" class="w-full border p-2 mb-4 rounded" required value="demo${Math.floor(Math.random()*1000)}@example.com">
            <input type="password" id="password" placeholder="Password" class="w-full border p-2 mb-6 rounded" required value="SecurePass123!">
            <div class="flex gap-4">
                <button onclick="login()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 flex-1 rounded transition">Login</button>
                <button onclick="register()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex-1 rounded transition">Register</button>
            </div>
        </div>
    `;
}

function renderDashboard() {
    appDiv.innerHTML = `
        <div class="flex justify-between items-center mb-8 border-b pb-4">
            <h1 class="text-3xl font-bold text-gray-800">My Notes</h1>
            <div class="flex items-center gap-4">
                <span class="text-gray-600 text-sm font-medium">${userEmail}</span>
                <button onclick="logout()" class="text-red-600 hover:bg-red-50 px-3 py-1 rounded transition">Logout</button>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Create Note Form -->
            <div class="bg-white p-6 rounded-lg shadow-sm border h-fit">
                <h3 class="text-xl font-semibold mb-4 text-gray-800">Create Note</h3>
                <div id="create-error" class="hidden bg-red-100 text-red-700 p-2 rounded mb-3 text-sm"></div>
                <input type="text" id="new-title" placeholder="Title" class="w-full border border-gray-300 p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                <textarea id="new-content" placeholder="Content" class="w-full border border-gray-300 p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" rows="4"></textarea>
                <input type="text" id="new-tags" placeholder="Tags (comma separated)" class="w-full border border-gray-300 p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                <button onclick="createNote()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 w-full rounded transition">Create Note</button>
            </div>

            <!-- Notes List -->
            <div class="md:col-span-2">
                <div class="flex mb-6 gap-3">
                    <input type="text" id="search-q" placeholder="Search notes..." class="border border-gray-300 p-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-gray-400">
                    <button onclick="searchNotes()" class="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded transition">Search</button>
                    <button onclick="fetchNotes()" class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2 rounded transition">My Notes</button>
                </div>
                <div id="notes-list" class="flex flex-col gap-4">
                    <div class="text-gray-500">Loading notes...</div>
                </div>
            </div>
        </div>
    `;
    fetchNotes();
}

function showError(id, message) {
    const el = document.getElementById(id);
    if(el) {
        el.innerText = message;
        el.classList.remove('hidden');
    } else {
        alert(message);
    }
}

function hideError(id) {
    const el = document.getElementById(id);
    if(el) el.classList.add('hidden');
}

async function register() {
    hideError('error');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await apiCall('/register', 'POST', { email, password });
        await login();
    } catch (e) {
        showError('error', e.message);
    }
}

async function login() {
    hideError('error');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        const data = await apiCall('/login', 'POST', { email, password });
        token = data.access_token;
        userEmail = email;
        localStorage.setItem('token', token);
        localStorage.setItem('userEmail', email);
        render();
    } catch (e) {
        showError('error', e.message);
    }
}

function logout() {
    token = null;
    userEmail = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    render();
}

async function fetchNotes() {
    try {
        const data = await apiCall('/notes?limit=100');
        renderNotesList(data.data || []);
    } catch (e) {
        if(e.message.includes('expired') || e.message.includes('Invalid')) logout();
        else alert('Error fetching notes: ' + e.message);
    }
}

async function searchNotes() {
    const q = document.getElementById('search-q').value;
    if(!q) return fetchNotes();
    try {
        const data = await apiCall('/search?q=' + encodeURIComponent(q));
        renderNotesList(data || []);
    } catch (e) {
        alert('Error searching: ' + e.message);
    }
}

async function createNote() {
    hideError('create-error');
    const title = document.getElementById('new-title').value;
    const content = document.getElementById('new-content').value;
    const tagsRaw = document.getElementById('new-tags').value;
    const tags = tagsRaw.split(',').map(t => t.trim()).filter(t => t);

    try {
        await apiCall('/notes', 'POST', { title, content, tags });
        document.getElementById('new-title').value = '';
        document.getElementById('new-content').value = '';
        document.getElementById('new-tags').value = '';
        fetchNotes();
    } catch (e) {
        showError('create-error', e.message);
    }
}

async function deleteNote(id) {
    if(!confirm('Delete this note?')) return;
    try {
        await apiCall('/notes/' + id, 'DELETE');
        fetchNotes();
    } catch (e) {
        alert('Could not delete: ' + e.message);
    }
}

async function shareNote(id) {
    const email = prompt("Enter the email to share this note with:");
    if (!email) return;
    try {
        await apiCall('/notes/' + id + '/share', 'POST', { share_with_email: email });
        alert('Note shared successfully!');
        fetchNotes(); 
    } catch (e) {
        alert('Could not share: ' + e.message);
    }
}

function renderNotesList(notes) {
    const list = document.getElementById('notes-list');
    if (notes.length === 0) {
        list.innerHTML = '<div class="text-gray-500 bg-white p-6 rounded border text-center">No notes found. Create your first note!</div>';
        return;
    }

    list.innerHTML = notes.map(note => `
        <div class="bg-white p-5 rounded-lg shadow-sm border relative group">
            <div class="pr-20">
                <h4 class="text-lg font-bold text-gray-800 mb-2">${note.title}</h4>
                <p class="text-gray-600 mb-4 whitespace-pre-wrap">${note.content}</p>
                <div class="flex flex-wrap gap-2 mb-2">
                    ${note.tags.map(t => `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${t}</span>`).join('')}
                </div>
                ${note.sharedWith && note.sharedWith.length > 0 ? `
                    <div class="text-xs text-gray-500 mt-2 border-t pt-2">
                        Shared with: ${note.sharedWith.join(', ')}
                    </div>
                ` : ''}
            </div>
            
            <!-- Actions -->
            <div class="absolute top-4 right-4 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <!-- If the note belongs to the user, not a friend -->
                <button onclick="shareNote('${note._id}')" class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded">Share</button>
                <button onclick="deleteNote('${note._id}')" class="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded">Delete</button>
            </div>
        </div>
    `).join('');
}

// Init
render();
