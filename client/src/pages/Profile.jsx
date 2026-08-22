import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        blood_group: "",
        dob: "",
        phone_number: "",
        health_info: ""
    });
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await API.get("/profile");
                const data = res.data.user;
                // Format date for input field
                if (data.dob) {
                    data.dob = new Date(data.dob).toISOString().split('T')[0];
                }
                setProfile(data);
            } catch (error) {
                console.error("Error fetching profile", error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchProfile();
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await API.put("/profile/update", profile);
            alert("Profile updated successfully ✅");
            setEditing(false);
        } catch (error) {
            alert("Update failed ❌");
        }
    };

    if (loading) return <div className="loading">Loading Profile...</div>;

    return (
        <div className="login-box profile-box">
            <h2>Your Profile 👤</h2>

            <form onSubmit={handleUpdate}>
                <div className="profile-field">
                    <label>Full Name</label>
                    <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        disabled={!editing}
                    />
                </div>

                <div className="profile-field">
                    <label>Email (Immutable)</label>
                    <input type="email" value={profile.email} disabled />
                </div>

                <div className="profile-field">
                    <label>Blood Group</label>
                    <select
                        value={profile.blood_group}
                        onChange={(e) => setProfile({ ...profile, blood_group: e.target.value })}
                        disabled={!editing}
                    >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                </div>

                <div className="profile-field">
                    <label>City</label>
                    <input
                        type="text"
                        value={profile.city || ""}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                        disabled={!editing}
                    />
                </div>

                <div className="profile-field">
                    <label>Date of Birth</label>
                    <input
                        type="date"
                        value={profile.dob || ""}
                        onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                        disabled={!editing}
                    />
                </div>

                <div className="profile-field">
                    <label>Phone Number</label>
                    <input
                        type="text"
                        value={profile.phone_number || ""}
                        onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                        disabled={!editing}
                    />
                </div>

                <div className="profile-field">
                    <label>Health Update / Details</label>
                    <textarea
                        value={profile.health_info || ""}
                        onChange={(e) => setProfile({ ...profile, health_info: e.target.value })}
                        disabled={!editing}
                        placeholder="Allergies, chronic conditions, etc."
                    />
                </div>

                {editing ? (
                    <div className="action-buttons">
                        <button type="submit" className="save-btn">Save Changes</button>
                        <button type="button" onClick={() => setEditing(false)} className="cancel-btn">Cancel</button>
                    </div>
                ) : (
                    <button type="button" onClick={() => setEditing(true)} className="edit-btn">Edit Profile</button>
                )}
            </form>
        </div>
    );
}

export default Profile;
