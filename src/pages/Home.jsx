import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import gifImage from './3dM80dk50G.gif';
import { motion } from "framer-motion";
import "./Home.css";


const Home = () => {
    const [language, setLanguage] = useState('english');
    const [isListening, setIsListening] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = true;

        recognition.onresult = (event) => {
            const speechResult = event.results[event.results.length - 1][0].transcript.toLowerCase();
            console.log('Speech recognition result:', speechResult);
            const synth = window.speechSynthesis;
            let utterThis;
            if (speechResult.includes('hello vachan pe')) {
                setLanguage('english');
                utterThis = new SpeechSynthesisUtterance('Welcome to Vachan Pay, how may I assist you?');
                setIsListening(true);
                // setResponseMessage('Welcome to Vachan Pay, how may I assist you?');
            } else if (speechResult.includes('suno vachan pe')) {
                setLanguage('hindi');
                utterThis = new SpeechSynthesisUtterance('vachan pe me aapka swaaagat hai. mai aapki kaisi madad kar sakta hu?');
                setIsListening(true);
                // setResponseMessage('vachan pe me aapka swaaagat hai. mai aapki kaisi madad kar sakta hu?');
            }

            if (utterThis) {
                synth.speak(utterThis);
            }

            if (isListening) {
                // Continue listening for user input
                setTimeout(() => {
                    sendTranscriptToBackend(speechResult);
                }, 2000); // Simulate delay for animation
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };

        recognition.start();

        return () => {
            recognition.stop();
        };
    }, [navigate, isListening]);

    const sendTranscriptToBackend = async (transcript) => {
        try {
            const response = await axios.post('http://localhost:3001/analyze-transcript', { transcript });
            const { intent, parameters } = response.data;
            handleIntent(intent, parameters);
        } catch (error) {
            console.error('Error sending transcript to backend:', error);
        }
    };

    const handleIntent = (intent, parameters) => {
        console.log('Handling intent:', intent, 'with parameters:', parameters);
        // Navigate based on intent and parameters
        switch (intent) {
            case 'make_payment':
                navigate('/payment', { state: { aiResponse: parameters, language } });
                break;
            case 'check_balance':
                navigate('/balance', { state: { language } });
                break;
            case 'check_history':
                navigate('/transactions', { state: { language } });
                break;
            default:
                console.log('Unknown intent:', intent);
        }
    };

    const data=sessionStorage.getItem("userData");
    console.log(data);
    const userData=JSON.parse(localStorage.getItem("userData"));
    console.log(userData);

    return (
        <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 50 }} 
            transition={{ duration: 0.5 }}
            className="page"
        >
            <div class="main-content">
            <header>
                <h1>Welcome Back, {userData.sendData.name}</h1>
            </header>
            <div class="card">
                    <i class="fas fa-microphone"></i>
                    <h3>Instructions</h3>
                    <p>Welcome to Vachanpay</p>
                    <p>Vachanpay में आपका स्वागत है</p>
                    <p>To initiate a transaction, say "Hello Vachanpay"</p>
                    <p>लेन-देन शुरू करने के लिए, कहें "सुनो Vachanpay"</p>
                    <p>{responseMessage}</p>
                </div>
           
            {/* <section class="dashboard">
                <div class="card">
                    <i class="fas fa-money-check-alt"></i>
                    <p>Send Money</p>
                </div>
                <div class="card">
                    <i class="fas fa-university"></i>
                    <p>Bank Statements</p>
                </div>
                <div class="card">
                    <i class="fas fa-bell"></i>
                    <p>Notifications</p>
                </div>
                <div class="card">
                    <i class="fas fa-user-shield"></i>
                    <p>Security</p>
                </div>
                
            </section> */}
        </div>
        </motion.div>
    );
};

export default Home;
