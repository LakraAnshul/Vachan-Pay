import React, { useState, useEffect } from "react";
import axios from "axios";

function Transactions() {
    const [transactionsData, setTransactionsData] = useState([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const accountNo = JSON.parse(localStorage.getItem("userData"))?.sendData?.account_number;
                const response = await axios.get("http://localhost:3001/api/transactions");

                if (response.data.success && Array.isArray(response.data.data)) {
                    const formatted = response.data.data.map((tx, index) => {
                        let date_time = "Invalid Date";
                        if (tx.transaction_time) {
                            const parsedDate = new Date(tx.transaction_time);
                            if (!isNaN(parsedDate)) {
                                date_time = parsedDate.toISOString().replace("T", " ").slice(0, 19);
                            }
                        }

                        return {
                            id: index + 1,
                            user_name: tx.user_name,
                            amount: parseFloat(tx.amount),
                            action: tx.action,
                            status: tx.status,
                            date_time
                        };
                    });
                    setTransactionsData(formatted);
                }
            } catch (err) {
                console.error("Error fetching transactions:", err);
            }
        };

        fetchTransactions();
    }, []);

    return (
        <div>
            <h2>Transactions</h2>
            <table>
                <thead>
                    <tr>
                        <th>User Name</th>
                        <th>Amount</th>
                        <th>Action</th>
                        <th>Status</th>
                        <th>Date & Time</th>
                    </tr>
                </thead>
                <tbody>
                    {transactionsData.map((tx) => (
                        <tr key={tx.id}>
                            <td>{tx.user_name}</td>
                            <td>₹{tx.amount}</td>
                            <td>{tx.action}</td>
                            <td>{tx.status}</td>
                            <td>{tx.date_time}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Transactions;
