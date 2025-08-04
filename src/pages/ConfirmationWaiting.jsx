import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ConfirmationWaiting.css';

const ConfirmationWaiting = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('pending');
    const userData = JSON.parse(localStorage.getItem('userData'));

    useEffect(() => {
        if (!userData) {
            navigate('/login');
            return;
        }

        const checkStatus = async () => {
            try {
                const response = await axios.get(`http://172.16.61.160:4001/check-confirmation/${userData.sendData.id}`);
                console.log('Status check response:', response.data);
                const currentStatus = response.data.status;
                
                if (currentStatus === 'confirmed') {
                    setIsAuthenticated(true);
                    navigate('/');
                } else if (currentStatus === 'rejected') {
                    localStorage.clear();
                    navigate('/login');
                }
                setStatus(currentStatus);
            } catch (error) {
                console.error('Error checking status:', error);
                if (error.response) {
                    console.log('Error response:', error.response.data);
                }
            }
        };

        const interval = setInterval(checkStatus, 2000);
        return () => clearInterval(interval);
    }, [navigate, setIsAuthenticated, userData]);

    return (
        <div className="confirmation-container">
            <div className="confirmation-content">
                <div className="confirmation-card">
                    <h1 className="confirmation-title">Voice Pay</h1>
                    <p className="confirmation-subtitle">Waiting for Authentication</p>
                    
                    <div className="progress-wrapper">
                        <div className="loader"></div>
                    </div>
                    
                    <div className="confirmation-message">
                        <p>Please complete the authentication on your mobile device</p>
                        <p className="status-text">Status: {status}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationWaiting;