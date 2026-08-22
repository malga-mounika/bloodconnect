import { useState, useEffect } from "react";
import API from "../services/api";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await API.get("/notifications/my");
            setNotifications(res.data.notifications);
        } catch (error) {
            console.error("Error fetching notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await API.put(`/notifications/read/${id}`);
            // Update local state to show as read
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
        } catch (error) {
            console.error("Error marking notification as read", error);
        }
    };

    if (loading) return <div className="loading">Loading alerts...</div>;

    return (
        <div className="notification-list">
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Your Alerts 🔔</h2>

            {notifications.length === 0 ? (
                <div className="login-box" style={{ textAlign: 'center' }}>
                    <p>No notifications yet. You'll be alerted when matching blood requests are raised!</p>
                </div>
            ) : (
                notifications.map((notif) => (
                    <div key={notif.id} className={`notification-item ${notif.is_read ? 'read' : ''}`}>
                        <div>
                            <p>{notif.message}</p>
                            <div className="notification-time">
                                {new Date(notif.created_at).toLocaleString()}
                            </div>
                        </div>
                        {!notif.is_read && (
                            <button
                                className="mark-read-btn"
                                onClick={() => markAsRead(notif.id)}
                            >
                                Mark as Read
                            </button>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default Notifications;
