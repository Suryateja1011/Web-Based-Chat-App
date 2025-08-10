import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
   apiKey: "AIzaSyABC123-YourRealKey",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const roomSelect = document.getElementById('room');
const joinBtn = document.getElementById('joinBtn');

async function loadRooms() {
  const snapshot = await getDocs(collection(db, 'rooms'));
  snapshot.forEach(doc => {
    const opt = document.createElement('option');
    opt.value = doc.id;
    opt.textContent = doc.id;
    roomSelect.appendChild(opt);
  });
}
loadRooms();

joinBtn.addEventListener('click', () => {
  const username = document.getElementById('username').value.trim();
  const room = roomSelect.value;
  if (!username) return alert('Enter a username');
  localStorage.setItem('username', username);
  localStorage.setItem('room', room);
  window.location.href = 'chat.html';
});
