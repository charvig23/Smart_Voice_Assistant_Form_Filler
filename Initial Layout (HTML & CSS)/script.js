const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'en-US';

const fields = document.querySelectorAll('#voiceForm input');
let currentFieldIndex = 0;

function speakText(text, callback) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.onend = callback;
    speechSynthesis.speak(utterance);
}


function validateInput(field, value) {
    const fieldType = field.getAttribute('type');
    
    if (fieldType === 'text') {  
        return /^[A-Za-z\s]+$/.test(value);
    } 
    if (fieldType === 'number') {  
        return /^\d+$/.test(value) && parseInt(value) > 0 && parseInt(value) < 120;
    } 
    if (fieldType === 'email') {  
        value = value.replace(/ at the rate /g, "@"); 
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(value);
    }
    return true;
}

function startFormFilling() {
    currentFieldIndex = 0;
    fillNextField();
}

function fillNextField() {
    if (currentFieldIndex >= fields.length) {
        speakText("Form completed. Thank you!");
        return;
    }

    let field = fields[currentFieldIndex];
    let label = document.querySelector(`label[for="${field.id}"]`).innerText;

    function askForInput() {
        speakText(`Please say your ${label}`, () => {
            recognition.start();
        });

        recognition.onresult = function(event) {
            let speechResult = event.results[0][0].transcript.trim();

            if (!validateInput(field, speechResult)) {
                speakText(`Invalid ${label}. Please try again.`);
                askForInput(); 
            } else {
                if (field.getAttribute('type') === 'email') {
                    speechResult = speechResult.replace(/ at the rate /g, "@"); 
                }
                field.value = speechResult;
                currentFieldIndex++;
                setTimeout(fillNextField, 1000);
            }
        };

        recognition.onerror = function(event) {
            console.error("Speech recognition error:", event.error);
            speakText("I didn't catch that. Please try again.");
            askForInput();
        };
    }

    askForInput();
}
