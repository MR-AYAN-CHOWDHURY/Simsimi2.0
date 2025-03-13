document.addEventListener("DOMContentLoaded", function () {
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");
    const chatBox = document.getElementById("chat-box");

    const teachForm = document.getElementById("teach-form");
    const teachAsk = document.getElementById("teach-ask");
    const teachAns = document.getElementById("teach-ans");
    const teachResponse = document.getElementById("teach-response");

    let knowledgeBase = {}; // Store learned responses

    chatForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (userMessage === "") return;

        addMessage("user", userMessage);
        chatInput.value = "";

        // Bot response logic
        setTimeout(() => {
            let botResponse = knowledgeBase[userMessage.toLowerCase()] || "I don't know that yet. Try teaching me!";
            addMessage("bot", botResponse);
        }, 800);
    });

    teachForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const question = teachAsk.value.trim().toLowerCase();
        const answer = teachAns.value.trim();

        if (question && answer) {
            knowledgeBase[question] = answer;
            teachResponse.textContent = "I learned something new!";
            teachAsk.value = "";
            teachAns.value = "";
            setTimeout(() => {
                teachResponse.textContent = "";
            }, 2000);
        }
    });

    function addMessage(sender, text) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", sender);
        messageDiv.textContent = text;
        chatBox.appendChild(messageDiv);

        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
