import { useState, useEffect } from 'react';
import './App.css';


const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'en-US';

const VoiceForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        email: '',
        passportNumber: '',
        nationality: '',
        dateOfBirth: '',
        gender: '',
        address: ''
    });

    const [currentFieldIndex, setCurrentFieldIndex] = useState(0);

    const fields = [
        { id: 'name', label: 'Full Name', type: 'text' },
        { id: 'age', label: 'Age', type: 'number' },
        { id: 'email', label: 'Email', type: 'email' },
        { id: 'passportNumber', label: 'Passport Number', type: 'text' },
        { id: 'nationality', label: 'Nationality', type: 'text' },
        { id: 'dateOfBirth', label: 'Date of Birth (YYYY-MM-DD)', type: 'text' },
        { id: 'gender', label: 'Gender (Male/Female/Other)', type: 'text' },
        { id: 'address', label: 'Address', type: 'text' }
    ];

    const speakText = (text, callback) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.onend = callback;
        window.speechSynthesis.speak(utterance);
    };

    const validateInput = (field, value) => {
        if (field.type === 'text') return /^[A-Za-z0-9\s,.-]+$/.test(value);
        if (field.type === 'number') return /^\d+$/.test(value) && value > 0 && value < 120;
        if (field.type === 'email') {
            value = value.replace(/ at the rate /g, '@');
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }
        return true;
    };

    const startFormFilling = () => {
        setCurrentFieldIndex(0);
        fillNextField();
    };

    const fillNextField = () => {
        if (currentFieldIndex >= fields.length) {
            speakText('Form completed. Thank you!');
            return;
        }

        const field = fields[currentFieldIndex];
        speakText(`Please say your ${field.label}`, () => recognition.start());

        recognition.onresult = (event) => {
            let speechResult = event.results[0][0].transcript.trim();

            if (!validateInput(field, speechResult)) {
                speakText(`Invalid ${field.label}. Please try again.`, fillNextField);
            } else {
                if (field.type === 'email') speechResult = speechResult.replace(/ at the rate /g, '@');
                setFormData((prev) => ({ ...prev, [field.id]: speechResult }));
                setCurrentFieldIndex((prev) => prev + 1);
                setTimeout(fillNextField, 1000);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            speakText("I didn't catch that. Please try again.", fillNextField);
        };
    };

    return (
        <div className="form-container">
            <h2 className="form-title">Voice-Controlled Passport Form</h2>
            <form className="form-content">
                {fields.map((field) => (
                    <div key={field.id} className="form-group">
                        <label htmlFor={field.id} className="form-label">{field.label}:</label>
                        <input
                            id={field.id}
                            type={field.type}
                            value={formData[field.id]}
                            readOnly
                            className="form-input"
                        />
                    </div>
                ))}
                <button
                    type="button"
                    onClick={startFormFilling}
                    className="form-button"
                >
                    Start Voice Input
                </button>
            </form>
        </div>
    );
};

export default VoiceForm;
