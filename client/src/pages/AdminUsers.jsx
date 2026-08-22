import { useState, useEffect } from "react";
import API from "../services/api";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await API.get("/admin/users");
            setUsers(res.data.users);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`⚠️ Are you sure you want to permanently delete "${name}"? This cannot be undone.`)) return;
        try {
            const res = await API.delete(`/admin/users/${id}`);
            alert(res.data.message);
            fetchUsers(); // Refresh list
        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete user.");
        }
    };

    if (loading) return <div>Loading Users...</div>;

    return (
        <div className="admin-users">
            <h3>Manage Users</h3>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Reg No</th>
                        <th>Role</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>{u.role === 'hospital' ? (u.hospital_registration_number || 'Pending/Legacy') : '-'}</td>
                            <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                            <td>
                                <button
                                    onClick={() => handleDelete(u.id, u.name)}
                                    style={{ background: '#f44336', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    🗑️ Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminUsers;
