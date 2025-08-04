import React, { useState, useRef } from 'react';
import { Lock, Mail, Eye, EyeOff, User, Phone, CreditCard } from 'lucide-react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Login.css';
import './Signup.css';

function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [signupEmail, setSignupEmail] = useState(''); // Add this state
  
  const nameRef = useRef(null);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const accountNumberRef = useRef(null);
  const phoneRef = useRef(null);
  const emailRef = useRef(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!otpSent) {
      try {
        const response = await axios.post("http://172.16.61.160:4001/signup", {
          name: nameRef.current.value,
          username: usernameRef.current.value,
          password: passwordRef.current.value,
          accountNo: accountNumberRef.current.value,
          mobileNo: phoneRef.current.value,
          email: emailRef.current.value
        });

        if (response.data.success) {
          setSignupEmail(emailRef.current.value); // Store email when signup is successful
          setOtpSent(true);
          // alert(response.data.message);
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        alert(error.response?.data?.message || "Error during signup. Please try again.");
      }
    } else {
      try {
        const response = await axios.post("http://172.16.61.160:4001/verify_otp", {
          email: signupEmail, // Use stored email instead of ref
          otp: emailOtp
        });
        
        if (response.data.success) {
          // alert(response.data.message);
          navigate('/login');
        } else {
          alert(response.data.message || "Error verifying OTP. Please try again.");
        }
      } catch (error) {
        alert(error.response?.data?.message || "Error verifying OTP. Please try again.");
      }
    }
  };

  return (
    <div className="app-container">
      <div className="signup-content">
        <div className="login-card">
          <div className="login-header">
            <h2>Create Account</h2>
          </div>
          <p className="tagline">Join Voice Pay for secure transactions</p>
          
          <form onSubmit={handleSignup}>
            {!otpSent ? (
              <>
                <div className="signup-form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className="input-group">
                      <div className="input-icon"><User /></div>
                      <input ref={nameRef} type="text" className="form-input" required />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <div className="input-group">
                      <div className="input-icon"><User /></div>
                      <input ref={usernameRef} type="text" className="form-input" required />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="input-group">
                      <div className="input-icon"><Lock /></div>
                      <input
                        ref={passwordRef}
                        type={showPassword ? "text" : "password"}
                        className="form-input password-input"
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
                  
                  <div className="form-group">
                    <label className="form-label">Account Number</label>
                    <div className="input-group">
                      <div className="input-icon"><CreditCard /></div>
                      <input ref={accountNumberRef} type="text" className="form-input" required />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <div className="input-group">
                      <div className="input-icon"><Phone /></div>
                      <input ref={phoneRef} type="tel" className="form-input" required />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="input-group">
                      <div className="input-icon"><Mail /></div>
                      <input ref={emailRef} type="email" className="form-input" required />
                    </div>
                  </div>
                </div>

                <div className="signup-button-container">
                  <button type="submit" className="submit-button">
                    {otpSent ? "Verify OTP" : "Sign Up"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Enter OTP sent to your email</label>
                  <input
                    type="text"
                    className="form-input"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    required
                  />
                </div>
                <div className="signup-button-container">
                  <button type="submit" className="submit-button">
                    Verify OTP
                  </button>
                </div>
              </>
            )}

            <div className="signup-link">
              <span className="signup-text">Already have an account? </span>
              <a href="/login" className="signup-anchor">Sign in</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;