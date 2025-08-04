import React, { useState,useEffect }  from "react";
import { BrowserRouter as Router,Routes,Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import AnimatedRoutes from "./AnimatedRoutes";
import Login from "./pages/Login";
import ConfirmationWaiting from './pages/ConfirmationWaiting';
import Settings from './pages/Settings';
import Signup from './pages/Signup';

function App() {
   const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
   );

   useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated);
   }, [isAuthenticated]);

    return (
        <Router>
            <div className="app-container">
                {!isAuthenticated ? (
                    <Routes>
                        <Route path="*" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route 
                            path="/confirmation-waiting" 
                            element={<ConfirmationWaiting setIsAuthenticated={setIsAuthenticated} />} 
                        />
                        // Inside your Routes component, add:
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                ) : (
                    <div className="container" >  
                        <Sidebar />
                        <div className="page-container" > 
                            <AnimatedRoutes />
                        </div>
                    </div>
                )}
            </div>
        </Router>
    );
}

export default App;
