import React from 'react';
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import Logout from "./pages/Logout";
import Payment from "./pages/Payment";
import Transaction from "./pages/Transaction";

function AnimatedRoutes() {
    const location = useLocation();
    

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/balance" element={<Transaction />} />
            </Routes>
        </AnimatePresence>
    );
}

export default AnimatedRoutes;
