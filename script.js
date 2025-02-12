const apiUrl = "https://openrouter.ai/api/v1/chat/completions";
const apiKey = "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"; // Replace with your OpenRouter API key
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-button");

// Function to append messages to the chat
function appendMessage(content, sender) {
    let messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");

    if (sender === "bot") {
        messageDiv.innerHTML = marked.parse(content); // Render Markdown
        setTimeout(() => {
            addCopyButtons();
            Prism.highlightAll();
        }, 100); // Ensure syntax highlighting & copy buttons appear
    } else {
        messageDiv.textContent = content;
    }

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
}

// Function to show "thinking" indicator
function showThinkingIndicator() {
    let thinkingDiv = document.createElement("div");
    thinkingDiv.classList.add("message", "bot-message", "thinking");
    thinkingDiv.innerHTML = "Thinking...";
    thinkingDiv.id = "thinking";
    chatBox.appendChild(thinkingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to remove "thinking" indicator
function removeThinkingIndicator() {
    let thinkingDiv = document.getElementById("thinking");
    if (thinkingDiv) {
        thinkingDiv.remove();
    }
}

// Function to fetch AI-generated response
async function fetchAiResponse(userMessage) {
    showThinkingIndicator();

    let res = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "deepseek/deepseek-r1:free",
            "messages": [{ "role": "user", "content": userMessage }]
        })
    });

    let responseJson = await res.json();
    let content = responseJson?.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    removeThinkingIndicator();
    appendMessage(content, "bot"); // Append AI response
}

// Function to add copy buttons to all <pre><code> blocks
function addCopyButtons() {
    document.querySelectorAll('pre').forEach((block) => {
        if (!block.querySelector(".copy-button")) {
            const button = document.createElement('button');
            button.className = "copy-button";
            button.innerHTML = '<i class="fas fa-clipboard"></i>';
            block.appendChild(button);

            button.addEventListener('click', () => {
                copyCode(block, button);
            });
        }
    });
}

// Function to copy the code block content
function copyCode(block, button) {
    const code = block.querySelector('code').innerText;
    navigator.clipboard.writeText(code).then(() => {
        button.innerHTML = '<i class="fas fa-check"></i>'; // Change to checkmark
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-clipboard"></i>'; // Revert back
        }, 1000);
    });
}

// Event listener for send button
sendButton.addEventListener("click", () => {
    let userMessage = chatInput.value.trim();
    if (userMessage !== "") {
        appendMessage(userMessage, "user");
        chatInput.value = "";
        fetchAiResponse(userMessage);
    }
});

// Event listener for pressing Enter in input box
chatInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sendButton.click();
    }
});
