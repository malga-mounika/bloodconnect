import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function HospitalRegister() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [registrationNumber, setRegistrationNumber] = useState("");
    const [city, setCity] = useState("");
    const [phone, setPhone] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            await API.post("/register", {
                name,
                email,
                password,
                role: "hospital",
                hospital_registration_number: registrationNumber,
                city,
                phone_number: phone
            });

            alert("Hospital Registration successful! ✅ Please wait for Admin approval.");
            navigate("/login");

        } catch (error) {
            const msg = error.response?.data?.message || "Registration failed ❌";
            alert(msg);
            console.log(error);
        }
    };

    return (
        <div className="login-box">
            <h2>Hospital Registration 🏥</h2>
            <p style={{ marginBottom: "20px", fontSize: "0.9rem", color: "#666" }}>
                Join the BloodConnect network to raise urgent requests.
            </p>

            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Hospital Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <input
                    type="email"
                    placeholder="Hospital Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <input
                    type="text"
                    placeholder="Hospital Registration Number"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    required
                />

                <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                />

                <input
                    type="text"
                    placeholder="Contact Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                />

                <button type="submit">Register Hospital</button>
            </form>
        </div>
    );
}

export default HospitalRegister;
