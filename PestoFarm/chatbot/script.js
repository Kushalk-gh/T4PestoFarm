document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chat-box');
  const messageInput = document.getElementById('message-input');
  const cityInput = document.getElementById('city-input');
  const sendButton = document.getElementById('send-button');
  const micButton = document.getElementById('mic-button');
  const cameraButton = document.getElementById('camera-button');
  const weatherButton = document.getElementById('weather-button');
  const imagePanel = document.getElementById('image-panel');
  const imageUpload = document.getElementById('image-upload');
  const processBtn = document.getElementById('process-image');
  const categorySelect = document.getElementById('category-select');

  const apiUrl = 'http://127.0.0.1:5000';

  function addMessage(text, isUser = false, image = null) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} items-start`;
    const bubble = document.createElement('div');
    bubble.className = `p-3 rounded-xl max-w-[80%] ${isUser ? 'bg-lime-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`;
    if (text) bubble.innerHTML = `<p>${text}</p>`;
    if (image) {
      const img = document.createElement('img');
      img.src = image;
      img.classList.add('w-32', 'h-auto', 'mt-2', 'rounded-md', 'border', 'border-gray-300');
      bubble.appendChild(img);
    }
    msgDiv.appendChild(bubble);
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    addMessage(message, true);
    messageInput.value = '';
    const response = await fetch(`${apiUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, city: cityInput.value, category: categorySelect.value }),
    });
    const data = await response.json();
    addMessage(data.response || "⚠️ Server not responding.");
  }

  async function sendWeatherRequest() {
    const city = cityInput.value.trim();
    if (!city) {
      addMessage("🌦️ Please enter a city name.");
      return;
    }
    addMessage(`Checking weather in ${city}...`, true);
    const response = await fetch(`${apiUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What is the weather?', city, category: 'intents' }),
    });
    const data = await response.json();
    addMessage(data.response);
  }

  sendButton.addEventListener('click', sendMessage);
  weatherButton.addEventListener('click', sendWeatherRequest);
  messageInput.addEventListener('keydown', e => e.key === 'Enter' && sendMessage());
  cityInput.addEventListener('keydown', e => e.key === 'Enter' && sendWeatherRequest());

  // 🎤 Speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    micButton.addEventListener('click', () => {
      recognition.start();
      micButton.classList.add('text-red-500', 'animate-pulse');
    });

    recognition.onresult = async event => {
      const transcript = event.results[0][0].transcript;
      addMessage(`🎤 You said: ${transcript}`, true);
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: transcript, city: cityInput.value, category: categorySelect.value }),
      });
      const data = await response.json();
      addMessage(data.response);
    };

    recognition.onend = () => {
      micButton.classList.remove('text-red-500', 'animate-pulse');
    };
  }

  // 📸 Toggle Image Panel
  cameraButton.addEventListener('click', () => {
    if (imagePanel.style.width === '0px' || imagePanel.style.width === '') {
      imagePanel.style.width = '300px';
    } else {
      imagePanel.style.width = '0';
    }
  });

  // 🧠 Process uploaded image
  processBtn.addEventListener('click', async () => {
    const file = imageUpload.files[0];
    if (!file) {
      alert('Please choose an image.');
      return;
    }

    addMessage("📸 Image uploaded. Processing...", true);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', categorySelect.value);
    formData.append('message', 'Analyze this image');
    formData.append('city', cityInput.value);

    const response = await fetch(`${apiUrl}/multimodal`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    addMessage(data.response || `⚠️ ${data.error}`);
  });
});
