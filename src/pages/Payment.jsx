import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './Payment.css';

const Payment = () => {
    const location = useLocation();
    const language = location.state?.language || 'english';
    const [recipientName, setRecipientName] = useState('');
    const [amount, setAmount] = useState('');
    const [nameSuggestions, setNameSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const { transcript, resetTranscript } = useSpeechRecognition();

    useEffect(() => {
        // Check if aiResponse is available in location.state
        if (location.state && location.state.aiResponse) {
            const { name, amount } = location.state.aiResponse;
            setRecipientName(name || '');
            setAmount(amount || '');

            // Fetch similar names once the name is set
            if (name) {
                fetchSimilarNames(name);
            }
        }
    }, [location.state]);

    const fetchSimilarNames = async (name) => {
        try {
            const response = await axios.get(`http://localhost:3001/search-users?name=${name}`);
            setNameSuggestions(response.data.data);
        } catch (error) {
            console.error('Error fetching name suggestions:', error);
        }
    };

    const handleNameSelection = (selectedName) => {
        setRecipientName(selectedName);
        setShowSuggestions(false);
    };

    const speak = (sentence, lang, callback) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Clear the speech queue
            const utterance = new SpeechSynthesisUtterance(sentence);
            utterance.lang = lang === 'english' ? 'en-US' : 'en-IN';

            // Select a specific female voice for en-IN if available
            const voices = window.speechSynthesis.getVoices();
            if (lang === 'hindi') {
                const enInFemaleVoice = voices.find(voice => voice.lang === 'en-IN' && voice.name.toLowerCase().includes('female'));
                if (enInFemaleVoice) {
                    utterance.voice = enInFemaleVoice;
                }
            }

            utterance.onend = () => {
                console.log('Speech synthesis finished speaking.');
                if (callback) callback(); // Execute callback after speaking
            };
            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event.error);
            };
            window.speechSynthesis.speak(utterance);
        } else {
            console.error('Speech Synthesis not supported in this browser.');
        }
    };

    const listenForConfirmation = () => {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = language === 'english' ? 'en-US' : 'en-IN';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event) => {
                const userResponse = event.results[0][0].transcript.toLowerCase();
                console.log('User response:', userResponse); // Log the user's response
                if (userResponse.includes('yes' || 'yas') || userResponse.includes('han')) {
                    console.log('Recognized confirmation: Yes');
                    setConfirmationMessage(`${language === 'english' ? 'Rs' : 'रुपये'} ${amount} ${language === 'english' ? 'has been transferred to' : 'जमा करें'} ${recipientName}.`);
                    setShowSuggestions(false); // Hide the form
                } else if (userResponse.includes('no') || userResponse.includes('nahi')) {
                    console.log('Recognized denial: No');
                    speak(language === 'english' ? 'Please say the amount to be sent again.' : 'kripiya fir se bheje jaane waali raashi bataaye', language, listenForAmount);
                }
            };

            recognition.start();
        } else {
            console.error('Speech Recognition not supported in this browser.');
        }
    };

    const listenForAmount = () => {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = language === 'english' ? 'en-US' : 'en-IN';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event) => {
                const userResponse = event.results[0][0].transcript;
                setAmount(userResponse);
                speak(`${userResponse} ${language === 'english' ? `will be transferred to ${recipientName}` : `${recipientName} ko bheji jaayegii`} . ${language === 'english' ? 'Do you confirm?' : 'kya aap bhejna chahate ho?'}`, language, null);
                listenForConfirmation();
            };

            recognition.start();
        } else {
            console.error('Speech Recognition not supported in this browser.');
        }
    };

    const listenForNameConfirmation = () => {
        if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
            console.error('Speech Recognition not supported in this browser.');
            return;
        }

        SpeechRecognition.startListening({ language: language === 'english' ? 'en-US' : 'en-IN', continuous: false });

        const checkNameMatch = () => {
            const spokenName = transcript.toLowerCase();
            const matchedName = nameSuggestions.find(suggestion => suggestion.name.toLowerCase().includes(spokenName));
            if (matchedName) {
                setRecipientName(matchedName.name);
                setShowSuggestions(false);
                speak(`${language === 'english' ? 'Name confirmed as' : 'naam ki pushti ho gayi hai'}: ${matchedName.name}`, language, () => {
                    speak(`${amount} ${language === 'english' ? 'will be transferred to' : 'ko bheji jayegi'} ${matchedName.name}. ${language === 'english' ? 'Do you wish to proceed?' : 'kya aap aage badhna chahte hain?'}`, language, listenForConfirmation);
                });
            } else {
                speak(language === 'english' ? 'Name not recognized, please try again.' : 'naam pehchana nahi gaya, kripiya phir se koshish karein.', language, listenForNameConfirmation);
            }
            resetTranscript();
        };

        setTimeout(checkNameMatch, 5000); // Wait for 5 seconds to allow user to speak
    };

    const handleSubmit = () => {
        // Simulate payment processing
        setConfirmationMessage(`${language === 'english' ? 'Rs' : 'रुपये'} ${amount} ${language === 'english' ? 'has been transferred to' : 'जमा करें'} ${recipientName}.`);
        setShowSuggestions(false); // Hide the form
    };

    const handleUserInteraction = () => {
        if (recipientName) {
            const confirmationMessage = `${language === 'english' ? 'Please confirm the name' : 'kripiya naam waa pus aek baar jaaanch kar le'}: ${recipientName}`;
            speak(confirmationMessage, language, listenForNameConfirmation); // Pass listenForNameConfirmation as callback
        }
    };

    return (
        <div className="card">
            {confirmationMessage ? (
                <p className="confirmation-message">{confirmationMessage}</p>
            ) : (
                <>
                    <h1>{language === 'english' ? 'Payment Form' : 'भुगतान फॉर्म'}</h1>
                    <button onClick={handleUserInteraction}>{language === 'english' ? 'Start Confirmation' : 'पुष्टि शुरू करें'}</button>
                    <form className="payment-form" onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group">
                            <label>{language === 'english' ? 'Recipient Name:' : 'प्राप्तकर्ता का नाम:'}</label>
                            <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
                            {showSuggestions && nameSuggestions.length > 0 && (
                                <ul className="suggestions-list">
                                    {nameSuggestions.map((suggestion) => (
                                        <li key={suggestion.id} onClick={() => handleNameSelection(suggestion.name)}>
                                            {suggestion.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="form-group">
                            <label>{language === 'english' ? 'Amount:' : 'राशि:'}</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                        </div>
                        <button type="submit">{language === 'english' ? 'Submit' : 'जमा करें'}</button>
                    </form>
                </>
            )}
        </div>
    );
};

export default Payment; 