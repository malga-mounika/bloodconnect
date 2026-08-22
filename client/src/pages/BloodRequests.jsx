import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function BloodRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [showCreate, setShowCreate] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        blood_group: "",
        city: "",
        hospital: "",
        units_required: "",
        contact_phone: ""
    });

    const fetchRequests = async () => {
        try {
            const res = await API.get("/request/all");
            setRequests(res.data.requests);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleCreateRequest = async (e) => {
        e.preventDefault();

        if (!/^\d{10}$/.test(formData.contact_phone)) {
            alert("Please enter a valid 10-digit contact number");
            return;
        }

        try {
            await API.post("/request/create", formData);
            alert("Blood request created! ✅");
            setShowCreate(false);
            fetchRequests();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create request");
        }
    };

    return (
        <div className="requests-container">
            <div className="header-actions">
                <h2>Blood Requests 🩸</h2>
                {user && (
                    <button onClick={() => setShowCreate(!showCreate)} className="main-btn">
                        {showCreate ? "Cancel" : "Post Request"}
                    </button>
                )}
            </div>

            {showCreate && (
                <div className="login-box create-request-box">
                    <form onSubmit={handleCreateRequest}>
                        <select
                            value={formData.blood_group}
                            onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                            required
                        >
                            <option value="">Select Blood Group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                        <input
                            type="text"
                            placeholder="City"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Hospital Name"
                            value={formData.hospital}
                            onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Units Required"
                            value={formData.units_required}
                            onChange={(e) => setFormData({ ...formData, units_required: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Contact Phone"
                            value={formData.contact_phone}
                            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                            required
                        />
                        <button type="submit">Submit Request</button>
                    </form>
                </div>
            )}

            {loading ? <p>Loading requests...</p> : (
                <div className="requests-grid">
                    {requests.map((req) => (
                        <div key={req.id} className="request-card">
                            <div className="blood-badge">{req.blood_group}</div>
                            <div className="request-info">
                                <h3>{req.hospital}</h3>
                                <p>📍 {req.city}</p>
                                <p>💧 {req.units_required} Units</p>
                                <p>📞 {req.contact_phone}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                    <span className={`status-tag ${req.status.toLowerCase()}`}>{req.status}</span>
                                    {user && user.role === 'user' && req.status === 'Pending' && req.user_id !== user.id && (
                                        <button
                                            onClick={() => handleAccept(req.id)}
                                            className="accept-btn"
                                            style={{ padding: '5px 15px', width: 'auto', margin: 0, fontSize: '0.85rem' }}
                                        >
                                            Accept
                                        </button>
                                    )}
                                    {user && req.user_id === user.id && req.status === 'Accepted' && (
                                        <button
                                            onClick={() => handleFulfill(req.id)}
                                            className="fulfill-btn"
                                            style={{ padding: '5px 15px', width: 'auto', margin: 0, fontSize: '0.85rem', backgroundColor: '#2e7d32' }}
                                        >
                                            Mark Fulfilled
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const handleAccept = async (id) => {
    try {
        await API.post(`/request/accept/${id}`);
        alert("Request accepted! Thank you for your kindness. 🩸");
        window.location.reload(); // Simple refresh to update status
    } catch (error) {
        alert(error.response?.data?.message || "Failed to accept request");
    }
};

const handleFulfill = async (id) => {
    try {
        await API.put(`/request/status/${id}`, { status: 'Fulfilled' });
        alert("Request marked as fulfilled! Thank you for the update. 🎉");
        window.location.reload();
    } catch (error) {
        alert(error.response?.data?.message || "Failed to update status");
    }
};

export default BloodRequests;
