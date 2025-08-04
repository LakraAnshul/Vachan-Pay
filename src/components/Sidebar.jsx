import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
    const navigate = useNavigate();
    if (location.pathname !== "/logout") {
        sessionStorage.setItem("lastPage", location.pathname);
    }

    return (
        <div className="sidebar">
            <h2>Voice Pay</h2>
            <ul>
                <li onClick={() => navigate("/")}>
                    <i className="fas fa-home"></i> Home
                </li>
                <li onClick={() => navigate('/payment')}>
                    <i className="fas fa-credit-card"></i> Payment
                </li>
                <li onClick={() => navigate('/balance')}>
                    <i className="fas fa-money-check-alt"></i> Balance
                </li>
                <li onClick={() => navigate("/transactions")}>
                    <i className="fas fa-exchange-alt"></i> Transactions
                </li>
                <li onClick={() => navigate("/settings")}>
                    <i className="fas fa-cog"></i> Settings
                </li>
                <li onClick={() => navigate("/logout")}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                </li>

            </ul>
        </div>
    );
};

export default Sidebar;
