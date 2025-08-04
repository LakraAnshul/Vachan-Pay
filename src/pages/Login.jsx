import React, { useState, useRef } from 'react';
import { Lock, Mail, Eye, EyeOff, Shield, Mic, Fingerprint, AlertTriangle } from 'lucide-react';
import './Login.css';
import axios from "axios";
import Qr from "./Qr.jsx";
import { useNavigate } from "react-router-dom";

function Login({ setIsAuthenticated }) {
  const [data, setData] = useState(null);
  const emailRef = useRef(null);  
  const passwordRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated1, setIsAuthenticated1] = useState(
    localStorage.getItem("isAuthenticated1") === "true"
  );
  
  const navigate = useNavigate();

  const handleLogIn = async(e) => {
    e.preventDefault();
    const response = await axios.post("http://172.16.61.160:4001/login", {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    });
    const temp = response.data;
    setData(temp);
    localStorage.setItem("userData", JSON.stringify(temp));
    console.log(temp);
    if (temp.success) {
      try {
        // Get user preferences after successful login
        const prefResponse = await axios.get(`http://172.16.61.160:4001/user-preferences/${temp.sendData.id}`);
        const preferences = prefResponse.data;
        
        // Handle routing based on preferences
        if (preferences.qr_auth && preferences.two_step_auth) {
          // Case 1: Both enabled
          setIsAuthenticated1(true); // This will redirect to QR
        } else if (preferences.qr_auth) {
          // Case 2: QR only
          setIsAuthenticated1(true); // This will redirect to QR
        } else if (preferences.two_step_auth) {
          // Case 4: Two-Step only
          navigate("/confirmation-waiting");
        } else {
          // Case 3: Both disabled
          setIsAuthenticated(true);
          navigate("/home");
        }

        await axios.put(`http://172.16.61.160:4001/update-status/${temp.sendData.id}`, {
          status: 'pending'
        });
        localStorage.setItem('userId', temp.sendData.id);
      } 
      catch (error) {
        // console.error('Error:', error);
        // alert("Error checking preferences. Please try again.");
      }
    } else {
      alert("Invalid email or password!");
    }
  };

  if(!isAuthenticated1) {
    return (
      <div className="app-container">
        <div className="login-content">
          <div className="login-card">
            <div className="login-header">
                <h2>Voice Pay</h2>
            </div>
            <p className="tagline">Secure payments with your voice</p>
            
            {/* Existing login form */}
            <form onSubmit={handleLogIn}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="input-group">
                  <div className="input-icon">
                    <Mail />
                  </div>
                  <input
                    id="email"
                    type="email"
                    ref={emailRef}
                    className="form-input"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="input-group">
                  <div className="input-icon">
                    <Lock />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    ref={passwordRef}
                    className="form-input password-input"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <div className="form-footer">
                <div className="remember-me">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="checkbox"
                  />
                  <label htmlFor="remember-me" className="checkbox-label">
                    Remember me
                  </label>
                </div>
                <a href="#" className="forgot-password">
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="submit-button">
                Sign in
              </button>

              <div className="signup-link" style={{ textAlign: 'center', marginTop: '1rem' }}>
                <span>Don't have an account? </span>
                <a href="/signup" style={{ color: '#007bff', textDecoration: 'none' }}>Sign up</a>
              </div>
            </form>
          </div>

          <div className="features-container">
            <div className="features-section">
                <div className="feature-card">
                    <div className="feature-icon voice-wave">
                        <Mic size={24} />
                    </div>
                    <h3>Voice Biometrics</h3>
                    <p>Your unique voice is your secure key</p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon pulse">
                    <Shield size={24} />
                  </div>
                  <h3>Advanced Security</h3>
                  <p>Bank-grade encryption & protection</p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon scan">
                    <Fingerprint size={24} />
                  </div>
                  <h3>Multi-Factor Auth</h3>
                  <p>Multiple layers of verification</p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon alert">
                    <AlertTriangle size={24} />
                  </div>
                  <h3>Fraud Detection</h3>
                  <p>Real-time transaction monitoring</p>
                </div>
            </div>

            <div className="security-badges">
                <div className="badge">ISO 27001</div>
                <div className="badge">256-bit SSL</div>
                <div className="badge">PCI DSS</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return <Qr setIsAuthenticated={setIsAuthenticated} setIsAuthenticated1={setIsAuthenticated1} />;
}

export default Login;