import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Logout.css"; // Import styles

const Logout = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    // Only store last page if it’s not already set (avoid overwriting on /logout)
    if (!sessionStorage.getItem("lastPage") || window.location.pathname !== "/logout") {
      sessionStorage.setItem("lastPage", document.referrer || "/");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated"); // Clear login state
    localStorage.removeItem("isAuthenticated1");
    window.location.reload(); // Refresh the page
  };

  const handleCancel = () => {
    let lastPage=sessionStorage.getItem("lastPage") || "/";
    navigate(lastPage, { replace: true }); 
    console.log(lastPage);// Navigate back to the last visited page
  };

  return showPopup ? (
    <div className="logout-overlay">
      <div className="logout-popup">
        <h2>Confirm Logout</h2>
        <p>Are you sure you want to log out?</p>
        <div className="logout-buttons">
          <button className="confirm-btn" onClick={handleLogout}>✔ Confirm</button>
          <button className="cancel-btn" onClick={handleCancel}>✖ Cancel</button>
        </div>
      </div>
    </div>
  ) : null;
};

export default Logout;
