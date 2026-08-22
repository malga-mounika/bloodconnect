import { useState, useEffect } from "react";
import API from "../services/api";

function DonationHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await API.get("/request/my-donations");
                setHistory(res.data.history);
            } catch (error) {
                console.error("Error fetching donation history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div className="loading">Loading History...</div>;

    return (
        <div className="requests-container">
            <h2>Your Donation History 🩸</h2>

            {history.length === 0 ? (
                <div className="empty-state">
                    <p>You haven't donated yet. Search for blood requests to start saving lives!</p>
                </div>
            ) : (
                <div className="requests-grid">
                    {history.map((item) => (
                        <div key={item.id} className="request-card history-card">
                            <div className="blood-badge">{item.blood_group}</div>
                            <div className="request-info">
                                <h3>{item.hospital}</h3>
                                <p>📍 {item.city}</p>
                                <p>📅 {new Date(item.donation_date).toLocaleDateString()}</p>
                                <span className={`status-tag completed`}>{item.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DonationHistory;
