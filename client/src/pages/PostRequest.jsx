import { useState, useEffect } from "react";
import API from "../services/api";

function PostRequest() {
    const [request, setRequest] = useState({
        blood_group: "",
        units_required: "",
        contact_phone: "",
        hospital_name: "", 
        city: ""
    });
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const fetchMyRequests = async () => {
        try {
            const res = await API.get("/request/my");
            setMyRequests(res.data.requests);
        } catch (error) {
            console.error("Error fetching hospital requests", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!/^\d{10}$/.test(request.contact_phone)) {
            alert("Please enter a valid 10-digit contact number");
            return;
        }

        setLoading(true);
        try {
            await API.post("/hospital/request/create", request);
            alert("Blood Request raised successfully! 🩸 Eligible donors will be notified.");
            setRequest({
                blood_group: "",
                units_required: "",
                contact_phone: "",
                hospital_name: "",
                city: ""
            });
            fetchMyRequests(); // Refresh list
        } catch (error) {
            alert(error.response?.data?.message || "Failed to post request");
        } finally {
            setLoading(false);
        }
    };

    const handleFulfill = async (id) => {
        try {
            await API.put(`/request/status/${id}`, { status: 'Fulfilled' });
            alert("Request marked as fulfilled! 🎉");
            fetchMyRequests(); // Refresh list
        } catch (error) {
            alert(error.response?.data?.message || "Failed to update status");
        }
    };

    return (
        <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Left side: Post Form */}
            <div className="login-box" style={{ margin: 0, flex: '1 1 400px' }}>
                <h2>Post Blood Request 🩸</h2>
                <p style={{ marginBottom: "20px", color: "#666" }}>Raise an alert for urgent blood requirements.</p>

                <form onSubmit={handleSubmit}>
                    <select
                        value={request.blood_group}
                        onChange={(e) => setRequest({ ...request, blood_group: e.target.value })}
                        required
                    >
                        <option value="">Select Blood Group Needed</option>
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
                        type="number"
                        placeholder="Units Required"
                        value={request.units_required}
                        onChange={(e) => setRequest({ ...request, units_required: e.target.value })}
                        required
                    />

                    <input
                        type="text"
                        placeholder="Contact Phone for this request"
                        value={request.contact_phone}
                        onChange={(e) => setRequest({ ...request, contact_phone: e.target.value })}
                        required
                    />

                    <input
                        type="text"
                        placeholder="Hospital Department / Floor (Optional)"
                        value={request.hospital_name}
                        onChange={(e) => setRequest({ ...request, hospital_name: e.target.value })}
                    />

                    <input
                        type="text"
                        placeholder="City"
                        value={request.city}
                        onChange={(e) => setRequest({ ...request, city: e.target.value })}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Posting..." : "Broadcast Request"}
                    </button>
                </form>
            </div>

            {/* Right side: Manage Requests */}
            <div className="hospital-requests-panel" style={{ flex: '1 1 500px', background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                <h3>Track Your Requests 📋</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>Manage and fulfill your active broadcasts.</p>

                {fetching ? <p>Loading your requests...</p> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table" style={{ width: '100%', fontSize: '0.9rem' }}>
                            <thead>
                                <tr>
                                    <th>Blood</th>
                                    <th>Units</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myRequests.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No requests raised yet.</td></tr>
                                ) : myRequests.map(req => (
                                    <tr key={req.id}>
                                        <td><strong>{req.blood_group}</strong></td>
                                        <td>{req.units_required}</td>
                                        <td>
                                            <span className={`status-tag ${req.status.toLowerCase()}`}>{req.status}</span>
                                        </td>
                                        <td>
                                            {req.status === 'Accepted' && (
                                                <button 
                                                    onClick={() => handleFulfill(req.id)}
                                                    style={{ padding: '5px 10px', fontSize: '0.75rem', background: '#2e7d32', width: 'auto' }}
                                                >
                                                    Fulfill
                                                </button>
                                            )}
                                            {req.status === 'Pending' && <span style={{ color: '#888', fontStyle: 'italic' }}>Waiting for donor...</span>}
                                            {req.status === 'Fulfilled' && <span style={{ color: '#2e7d32' }}>✅ Done</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PostRequest;
