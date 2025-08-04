import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import "./Qr.css";
import axios from "axios";

function Qr({ setIsAuthenticated, setIsAuthenticated1 }) {
    const [qrValue, setQrValue] = useState("");
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
    const [isExpired, setIsExpired] = useState(false);
    const navigate = useNavigate();
    const verifyIntervalRef = useRef(null);

    const [Qrdata, setQrData] = useState(JSON.parse(localStorage.getItem("userData")));
    console.log(Qrdata.sendData);
    localStorage.removeItem("isAuthenticated1");
    
    // Generate QR code on component load if empty
    useEffect(() => {
        if (qrValue === "") {
            generateQR();
        }
        
        // Start the countdown timer
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        // Start automatic verification
        verifyIntervalRef.current = setInterval(autoVerify, 3000);
        
        // Cleanup on unmount
        return () => {
            clearInterval(timer);
            clearInterval(verifyIntervalRef.current);
        };
    }, []);
    
    const generateQR = () => {
        const id = `${Qrdata.sendData.id}`;
        const email = `${Qrdata.sendData.email}`;
        const token = `${Qrdata.sendData.token}`;
        const timestamp = Date.now(); // Add timestamp to make QR unique on refresh
        const qrData = JSON.stringify({ id, token, timestamp });
        setQrValue(qrData);
    };
    
    const refreshQR = () => {
        setIsExpired(false);
        setTimeLeft(120);
        generateQR();
        
        // Restart verification process
        clearInterval(verifyIntervalRef.current);
        verifyIntervalRef.current = setInterval(autoVerify, 3000);
    };
    
    const autoVerify = async () => {
        try {
            console.log('Auto-verifying...');
            
            const response = await axios.post("http://172.16.61.160:4001/verify", {
                id: Qrdata.sendData.id,
                token: Qrdata.sendData.token
            });

            if (response.data.verified) {
                clearInterval(verifyIntervalRef.current);
                try {
                    // Check preferences again to ensure current state
                    const prefResponse = await axios.get(`http://172.16.61.160:4001/user-preferences/${Qrdata.sendData.id}`);
                    const preferences = prefResponse.data;

                    if (preferences.two_step_auth) {
                        // If two-step is enabled, go to confirmation
                        navigate("/confirmation-waiting");
                    } else {
                        // If only QR was enabled, go directly to home
                        setIsAuthenticated(true);
                        setIsAuthenticated1(false);
                        navigate("/home");
                    }
                } catch (error) {
                    console.error("Error checking preferences:", error);
                    // Fallback to home on error
                    setIsAuthenticated(true);
                    setIsAuthenticated1(false);
                    navigate("/home");
                }
            }
        } catch (error) {
            console.log("Auto-verification attempt failed");
        }
    };

    const verify = async (e) => {
        try {
            const response = await axios.post("http://localhost:5000/verify", {
                id: Qrdata.sendData.id,
                token: Qrdata.sendData.token
            });
            
            if (response.data.verified) {
                try {
                    // Check preferences again to ensure current state
                    const prefResponse = await axios.get(`http://localhost:5000/user-preferences/${Qrdata.sendData.id}`);
                    const preferences = prefResponse.data;

                    if (preferences.two_step_auth) {
                        navigate("/confirmation-waiting");
                    } else {
                        setIsAuthenticated(true);
                        setIsAuthenticated1(false);
                        navigate("/home");
                    }
                } catch (error) {
                    console.error("Error checking preferences:", error);
                    alert("Error checking preferences. Please try again.");
                }
            } else {
                alert("Authentication failed. Valid token not found");
            }
        } catch (error) {
            console.error("Verification error:", error);
            if (error.response) {
                console.log('Error response data:', error.response.data);
                alert(`Server error: ${error.response.data.message}`);
            } else {
                alert("Connection error. Check internet");
            }
        }
    };

    const goBack = () => {
        localStorage.removeItem("isAuthenticated1");
        setIsAuthenticated1(false);
        navigate("/"); 
    };

    return (
        <div className="qr-container">
            <div className="qr-content">
                <div className="qr-left">
                    <div className="qr-header">
                        <h1 className="qr-title">Voice Pay</h1>
                        <p className="qr-subtitle">Scan QR Code</p>
                        <p className="qr-description">
                            Secure banking with Double Authentication
                        </p>
                        <div className="scanning-instructions">
                            <p>• Open the app</p>
                            <p>• Tap Scanner</p>
                            <p>• Scan the QR code</p>
                        </div>
                    </div>
                    
                    <div className="qr-buttons">
                        <button className="verify-btn" onClick={verify}>
                            Verify
                        </button>
                        <button className="back-btn" onClick={goBack}>
                            Go Back
                        </button>
                    </div>
                </div>

                <div className="qr-right">
                    <div className="qr-code-container">
                        <div className="qr-code-wrapper">
                            <div className={`qr-code-overlay ${isExpired ? 'expired' : ''}`}>
                                <QRCodeCanvas
                                    value={qrValue}
                                    size={300}
                                    level="H"
                                    className="qr-code"
                                    bgColor="#ffffff"
                                    fgColor="#2d3748"  // Changed to match theme
                                    imageSettings={{
                                        src: "/logo.png",
                                        height: 60,
                                        width: 60,
                                        excavate: true,
                                    }}
                                    style={{
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                {isExpired && (
                                    <div className="qr-expired-overlay">
                                        <button className="refresh-btn" onClick={refreshQR}>
                                            Refresh QR
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="qr-timer">
                                {!isExpired 
                                    ? `Time remaining: ${Math.floor(timeLeft/60)}:${(timeLeft%60).toString().padStart(2, '0')}`
                                    : "QR Code expired"
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Qr;