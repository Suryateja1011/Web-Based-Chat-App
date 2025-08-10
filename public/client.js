const socket = io();

const username = prompt("Enter your username:");
const room = prompt("Enter room name:");

socket.emit('joinRoom', { username, room });

const form = document.getElementById('chat-form');
const messages = document.getElementById('messages');

socket.on('chatHistory', (history) => {
  history.forEach(msg => {
    addMessage(msg.username, msg.text, msg.timestamp?.toDate?.() || new Date());
  });
});

socket.on('chatMessage', (msg) => {
  addMessage(msg.username, msg.text, msg.timestamp);
});

socket.on('systemMessage', (msg) => {
  addMessage('System', msg, new Date(), true);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = e.target.elements.msg;
  const text = input.value;
  socket.emit('chatMessage', { username, room, text });
  input.value = '';
});

function addMessage(user, text, time, isSystem = false) {
  const li = document.createElement('li');
  li.innerHTML = `<strong>${user}</strong> [${new Date(time).toLocaleTimeString()}]: ${text}`;
  if (isSystem) li.style.color = 'gray';
  messages.appendChild(li);
}
