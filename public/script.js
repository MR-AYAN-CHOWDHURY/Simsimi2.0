const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");

const teachForm = document.getElementById("teach-form");
const teachAsk = document.getElementById("teach-ask");
const teachAns = document.getElementById("teach-ans");
const teachResponse = document.getElementById("teach-response");

let userName = "";


function addMessage(text, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender);
  messageDiv.textContent = text;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight; 
}


addMessage("Bot: Hi! My Name Is 亗ㅤ𝐕𝐄𝐗 𝐀𝐃𝐍𝐀𝐍ㅤ亗. What's your name?", "bot");


chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  if (!userName) {
    
    userName = userMessage;
    addMessage("You: " + userMessage, "user");
    addMessage(`Bot: Nice to meet you, ${userName}! How can I help you today?`, "bot");
    chatInput.value = "";
    return;
  }

  
  addMessage(`${userName}: ${userMessage}`, "user");

  
  chatInput.value = "";

  try {
    
    const response = await fetch(`/sim?ask=${encodeURIComponent(userMessage)}`);
    const data = await response.json();

    
    addMessage("Bot: " + data.respond, "bot");
  } catch (err) {
    console.error("Error:", err);
    addMessage("Bot: Error connecting to server. Please try again later.", "bot");
  }
});


teachForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const askValue = teachAsk.value.trim();
  const ansValue = teachAns.value.trim();
  if (!askValue || !ansValue) return;

  try {
    
    const response = await fetch(
      `/teach?ask=${encodeURIComponent(askValue)}&ans=${encodeURIComponent(ansValue)}`
    );
    const data = await response.json();

    
    if (data.ask && data.ans) {
      teachResponse.textContent = `Successfully taught the bot!`;
      teachAsk.value = "";
      teachAns.value = "";
    } else {
      teachResponse.textContent = "Failed to teach the bot.";
    }
  } catch (err) {
    console.error("Error:", err);
    teachResponse.textContent = "Error connecting to server.";
  }

  
  setTimeout(() => {
    teachResponse.textContent = "";
  }, 3000);
});
