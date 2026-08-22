import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await API.post("/login", {
                email,
                password,
            });

            login(res.data.token);
            alert("Login successful ✅");

            if (res.data.role === 'admin') {
                navigate("/admin");
            } else if (res.data.role === 'hospital') {
                navigate("/hospital/post");
            } else {
                navigate("/requests");
            }
        } catch (error) {
            const msg = error.response?.data?.message || "Login failed ❌";
            alert(msg);
            console.log(error);
        }
    };

    return (
        <div className="login-box">
            <h2>Login</h2>

            <form onSubmit={handleLogin}>
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

                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;