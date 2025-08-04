import React, { useState, useEffect } from 'react';
import { Shield, QrCode, Lock } from 'lucide-react';
import './Settings.css';

function Settings() {
  const [twoStepAuth, setTwoStepAuth] = useState(false);
  const [qrAuth, setQrAuth] = useState(false);
  const [masterAuth, setMasterAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const userId = userData.sendData.id;
      console.log('User ID:', userId);
      fetchPreferences(userId);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchPreferences = async (userId) => {
    try {
      const response = await fetch(`http://172.16.61.160:4001/user-preferences/${userId}`);
      const data = await response.json();
      setTwoStepAuth(data.two_step_auth);
      setQrAuth(data.qr_auth);
      setMasterAuth(data.two_step_auth && data.qr_auth);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (type) => {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) return;
    const userData = JSON.parse(userDataString);
    const userId = userData.sendData.id;

    try {
      let updates = {};

      if (type === 'master') {
        const newState = !masterAuth;
        setMasterAuth(newState);
        setQrAuth(newState);
        setTwoStepAuth(newState);
        updates = {
          qr_auth: newState,
          two_step_auth: newState
        };
      } else if (type === 'qr') {
        const newQr = !qrAuth;
        setQrAuth(newQr);
        const newMaster = newQr && twoStepAuth;
        setMasterAuth(newMaster);
        updates = { qr_auth: newQr };
      } else if (type === 'two_step') {
        const newTwoStep = !twoStepAuth;
        setTwoStepAuth(newTwoStep);
        const newMaster = qrAuth && newTwoStep;
        setMasterAuth(newMaster);
        updates = { two_step_auth: newTwoStep };
      }

      const response = await fetch(`http://172.16.61.160:4001/user-preferences/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!data.success) {
        await fetchPreferences(userId);
        alert('Failed to update settings. Please try again.');
      }

    } catch (error) {
      console.error('Error updating preferences:', error);
      await fetchPreferences(userId);
      alert('Error updating settings. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="settings-container">Loading...</div>;
  }

  return (
    <div className="settings-container">
      <div className="settings-card">
        <h2>Security Settings</h2>
        <div className="settings-content">
          <div className="setting-item">
            <div className="setting-header">
              <Lock size={24} />
              <h3>Two - Step Authentication Methods</h3>
            </div>
            <p className="setting-description">
              Enable or disable all authentication methods at once
            </p>
            <label className="toggle">
              <input
                type="checkbox"
                checked={masterAuth}
                onChange={() => handleToggle('master')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-header">
              <QrCode size={24} />
              <h3>QR Authentication</h3>
            </div>
            <p className="setting-description">
              Scan QR code to verify your identity
            </p>
            <label className="toggle">
              <input
                type="checkbox"
                checked={qrAuth}
                onChange={() => handleToggle('qr')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-header">
              <Shield size={24} />
              <h3>Verification Authentication</h3>
            </div>
            <p className="setting-description">
              Enable additional confirmation step on your phone after QR scan
            </p>
            <label className="toggle">
              <input
                type="checkbox"
                checked={twoStepAuth}
                onChange={() => handleToggle('two_step')}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
