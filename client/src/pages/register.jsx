import { useState } from "react";
import API from "../services/api";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");
    const [city, setCity] = useState("");
    const [dob, setDob] = useState("");
    const [phone, setPhone] = useState("");
    const [healthInfo, setHealthInfo] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!/^\d{10}$/.test(phone)) {
            alert("Please enter a valid 10-digit contact number");
            return;
        }
        setLoading(true);
        try {
            await API.post("/send-otp", { phone });
            alert("OTP sent! (Check server terminal for the mock OTP)");
            setOtpSent(true);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!/^\d{10}$/.test(phone)) {
            alert("Please enter a valid 10-digit contact number");
            return;
        }

        if (otpSent && !otp) {
            alert("Please enter the 6-digit OTP");
            return;
        }

        setLoading(true);
        try {
            await API.post("/register", {
                name,
                email,
                password,
                bloodGroup,
                city,
                dob,
                phone_number: phone,
                health_info: healthInfo,
                otp
            });

            alert("Registration successful ✅ You can now log in.");
            window.location.href = "/login"; // redirect to login

        } catch (error) {
            const msg = error.response?.data?.message || "Registration failed ❌";
            alert(msg);
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-box">
            <h2>Register</h2>

            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <input
                    type="email"
                    placeholder="Email"
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
                    type="date"
                    placeholder="Date of Birth"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                />

                <input
                    type="text"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                />

                <textarea
                    placeholder="Health Related Details (e.g. allergies, last donation date, etc.)"
                    value={healthInfo}
                    onChange={(e) => setHealthInfo(e.target.value)}
                    className="health-textarea"
                    disabled={otpSent}
                />

                {!otpSent ? (
                    <button type="button" onClick={handleSendOtp} disabled={loading}>
                        {loading ? "Sending..." : "Send Verification OTP"}
                    </button>
                ) : (
                    <>
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? "Registering..." : "Verify & Register"}
                        </button>
                    </>
                )}
            </form>
        </div>
    );
}

export default Register;