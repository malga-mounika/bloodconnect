import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function RegisterDonor() {
    const [bloodGroup, setBloodGroup] = useState("");
    const [city, setCity] = useState("");
    const [phone, setPhone] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await API.post("/donor/register", {
                blood_group: bloodGroup,
                city,
                phone
            });
            alert("Registered as donor successfully ✅");
            navigate("/donors");
        } catch (error) {
            alert(error.response?.data?.message || "Registration failed ❌");
        }
    };

    return (
        <div className="login-box">
            <h2>Become a Donor 🩸</h2>
            <form onSubmit={handleRegister}>
                <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
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
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                />
                <button type="submit">Register as Donor</button>
            </form>
        </div>
    );
}

export default RegisterDonor;
