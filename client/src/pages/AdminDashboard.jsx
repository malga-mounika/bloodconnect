import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import API from "../services/api";
import AdminUsers from "./AdminUsers";

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [pendingHospitals, setPendingHospitals] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    
    // NEW STATES
    const [allUsers, setAllUsers] = useState([]);
    const [allDonors, setAllDonors] = useState([]);
    const [allRequests, setAllRequests] = useState([]);
    const [activeTab, setActiveTab] = useState(null);

    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes, reqsRes, donorsRes] = await Promise.all([
                API.get("/admin/dashboard"),
                API.get("/admin/users"),
                API.get("/admin/requests"),
                API.get("/admin/donors")
            ]);

            setStats(statsRes.data.dashboard);
            
            setAllUsers(usersRes.data.users);
            setAllRequests(reqsRes.data.requests);
            setAllDonors(donorsRes.data.donors || []);

            // Filter unverified hospitals
            const unverifiedHosps = usersRes.data.users.filter(u => u.role === 'hospital' && !u.is_verified);
            setPendingHospitals(unverifiedHosps);

            // Filter unverified requests
            const unverifiedReqs = reqsRes.data.requests.filter(r => !r.is_admin_verified);
            setPendingRequests(unverifiedReqs);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleVerifyHospital = async (id, status) => {
        try {
            await API.post(`/admin/hospitals/verify/${id}`, { status });
            alert(`Hospital ${status ? 'Verified' : 'Rejected'}! ✅`);
            fetchData();
        } catch (error) {
            alert("Error verifying hospital");
        }
    };

    const handleVerifyRequest = async (id, status) => {
        try {
            await API.post(`/admin/requests/verify/${id}`, { status });
            alert(`Request ${status ? 'Approved' : 'Rejected'}! ✅`);
            fetchData();
        } catch (error) {
            alert("Error verifying request");
        }
    };

    const renderActiveTabContent = () => {
        if (!activeTab) return null;

        let data = [];
        let headers = [];
        let renderRow = () => {};

        if (activeTab === 'users') {
            data = allUsers;
            headers = ["ID", "Name", "Email", "Role", "Verification"];
            renderRow = (u) => (
                <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                    <td>{u.role === 'hospital' ? (u.is_verified ? 'Verified' : 'Pending') : '-'}</td>
                </tr>
            );
        } else if (activeTab === 'donors') {
            data = allDonors;
            headers = ["ID", "Name", "Email", "Blood Group", "City", "Phone"];
            renderRow = (d) => (
                <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.name}</td>
                    <td>{d.email}</td>
                    <td><strong style={{ color: '#d32f2f' }}>{d.blood_group}</strong></td>
                    <td>{d.city}</td>
                    <td>{d.phone}</td>
                </tr>
            );
        } else if (activeTab === 'pending_requests') {
            data = allRequests.filter(r => r.status === 'Pending');
            headers = ["ID", "Hospital", "Blood Group", "Units", "City", "Admin Verified"];
            renderRow = (r) => (
                <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.hospital}</td>
                    <td><strong style={{ color: '#d32f2f' }}>{r.blood_group}</strong></td>
                    <td>{r.units_required}</td>
                    <td>{r.city}</td>
                    <td>{r.is_admin_verified ? 'Yes' : 'No'}</td>
                </tr>
            );
        } else if (activeTab === 'fulfilled_requests') {
            data = allRequests.filter(r => r.status === 'Fulfilled');
            headers = ["ID", "Hospital", "Blood Group", "Units", "City", "Admin Verified"];
            renderRow = (r) => (
                <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.hospital}</td>
                    <td><strong style={{ color: '#d32f2f' }}>{r.blood_group}</strong></td>
                    <td>{r.units_required}</td>
                    <td>{r.city}</td>
                    <td>{r.is_admin_verified ? 'Yes' : 'No'}</td>
                </tr>
            );
        }

        return (
            <div style={{ marginTop: '40px', padding: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>
                        {activeTab === 'users' && '👥 All Users'}
                        {activeTab === 'donors' && '🩸 All Donors'}
                        {activeTab === 'pending_requests' && '⏳ Pending Requests'}
                        {activeTab === 'fulfilled_requests' && '✅ Fulfilled Requests'}
                    </h3>
                    <button onClick={() => setActiveTab(null)} style={{ background: '#f44336', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
                </div>
                {data.length === 0 ? <p>No records found.</p> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    {headers.map((h, i) => <th key={i}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map(renderRow)}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    if (loading) return <div>Loading Admin Dashboard...</div>;

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Admin Panel 👑</h2>
                <nav className="admin-nav">
                    <Link to="/admin">Dashboard</Link>
                    <Link to="/admin/users">Manage Users</Link>
                </nav>
            </div>

            <Routes>
                <Route index element={
                    <>
                        {/* STATS GRID */}
                        <div className="stats-grid">
                            <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s', border: activeTab === 'users' ? '2px solid #d32f2f' : '1px solid #ddd' }} onClick={() => setActiveTab('users')}>
                                <img src="/totalusers.png" alt="Total Users" style={{ width: '48px', marginBottom: '8px' }} />
                                <h4>Total Users</h4>
                                <p>{stats?.total_users}</p>
                            </div>
                            <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s', border: activeTab === 'donors' ? '2px solid #d32f2f' : '1px solid #ddd' }} onClick={() => setActiveTab('donors')}>
                                <img src="/totaldonors.png" alt="Total Donors" style={{ width: '48px', marginBottom: '8px' }} />
                                <h4>Total Donors</h4>
                                <p>{stats?.total_donors}</p>
                            </div>
                            <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s', border: activeTab === 'pending_requests' ? '2px solid #d32f2f' : '1px solid #ddd' }} onClick={() => setActiveTab('pending_requests')}>
                                <img src="/pendingrequests.png" alt="Pending Requests" style={{ width: '48px', marginBottom: '8px' }} />
                                <h4>Pending Requests</h4>
                                <p>{stats?.pending_requests}</p>
                            </div>
                            <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s', border: activeTab === 'fulfilled_requests' ? '2px solid #d32f2f' : '1px solid #ddd' }} onClick={() => setActiveTab('fulfilled_requests')}>
                                <img src="/fullfilled.png" alt="Fulfilled" style={{ width: '48px', marginBottom: '8px' }} />
                                <h4>Fulfilled</h4>
                                <p>{stats?.fulfilled_requests}</p>
                            </div>
                        </div>

                        {activeTab ? renderActiveTabContent() : (
                            <>
                                {/* PENDING HOSPITALS */}
                                <div style={{ marginTop: '40px' }}>
                                    <h3>🏥 Pending Hospital Verifications</h3>
                                    {pendingHospitals.length === 0 ? <p>No hospitals pending verification.</p> : (
                                        <div className="requests-grid" style={{ gridTemplateColumns: '1fr' }}>
                                            {pendingHospitals.map(h => (
                                                <div key={h.id} className="request-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <h4>{h.name}</h4>
                                                        <p><strong>Reg No:</strong> {h.hospital_registration_number || 'N/A'}</p>
                                                        <p>{h.email}</p>
                                                    </div>
                                                    <div>
                                                        <button onClick={() => handleVerifyHospital(h.id, true)} style={{ padding: '5px 15px', marginRight: '10px' }}>Verify</button>
                                                        <button onClick={() => handleVerifyHospital(h.id, false)} style={{ background: '#f44336', padding: '5px 15px' }}>Reject</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* PENDING REQUESTS */}
                                <div style={{ marginTop: '40px' }}>
                                    <h3>🩸 Pending Blood Requests</h3>
                                    {pendingRequests.length === 0 ? <p>No blood requests pending verification.</p> : (
                                        <div className="requests-grid" style={{ gridTemplateColumns: '1fr' }}>
                                            {pendingRequests.map(r => (
                                                <div key={r.id} className="request-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <h4>{r.hospital} needs {r.blood_group}</h4>
                                                        <p>📍 {r.city} | 💧 {r.units_required} Units</p>
                                                    </div>
                                                    <div>
                                                        <button onClick={() => handleVerifyRequest(r.id, true)} style={{ padding: '5px 15px', marginRight: '10px' }}>Approve</button>
                                                        <button onClick={() => handleVerifyRequest(r.id, false)} style={{ background: '#f44336', padding: '5px 15px' }}>Reject</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                } />
                <Route path="users" element={<AdminUsers />} />
            </Routes>
        </div>
    );
}

export default AdminDashboard;
