const socket = io();
const username = localStorage.getItem('username');
const room = localStorage.getItem('room');

if (!username || !room) {
  window.location.href = 'index.html';
}

socket.emit('joinRoom', { username, room });

socket.on('message', (msg) => {
  const div = document.createElement('div');
  div.innerHTML = `<strong>${msg.user}:</strong> ${msg.text}`;
  document.getElementById('messages').appendChild(div);
});

document.getElementById('sendBtn').addEventListener('click', () => {
  const msg = document.getElementById('msgInput').value;
  if (msg.trim()) {
    socket.emit('chatMessage', msg);
    document.getElementById('msgInput').value = '';
  }
});
