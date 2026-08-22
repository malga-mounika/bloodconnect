import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        if (!user || user.role !== 'user') return;
        try {
            const res = await API.get("/notifications/my");
            const unread = res.data.notifications.filter(n => !n.is_read).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error("Notifications fetch failed", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // 30s poll
        return () => clearInterval(interval);
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link to="/">BloodConnect 🩸</Link>
            </div>
            <div className="nav-links">
                {user ? (
                    <>
                        {user.role === 'user' && (
                            <>
                                <Link to="/requests">Requests</Link>
                                <Link to="/notifications" style={{ position: 'relative' }}>
                                    🔔 {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                                </Link>
                                <Link to="/donors">Donors</Link>
                                <Link to="/history">History</Link>
                                <Link to="/profile">Profile</Link>
                            </>
                        )}
                        {user.role === 'hospital' && (
                            <>
                                <Link to="/hospital/post">Post Request</Link>
                                <Link to="/hospital/stock">Blood Stock</Link>
                                <Link to="/profile">Profile</Link>
                            </>
                        )}
                        {user.role === 'admin' && (
                            <>
                                <Link to="/admin">Dashboard</Link>
                                <Link to="/admin/users">Manage Users</Link>
                                <Link to="/profile">Profile</Link>
                            </>
                        )}
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Join as Donor</Link>
                        <Link to="/hospital/register">Hospital Portal</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
