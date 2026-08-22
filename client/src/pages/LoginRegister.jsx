import { useState } from "react";
import Login from "./login";
import Register from "./register";

function LoginRegister() {
    const [page, setPage] = useState("login");

    return (
        <div className="login-register-page">
            <h1 className="title">BloodConnect 🩸</h1>

            {page === "login" ? <Login /> : <Register />}

            <div className="toggle-container">
                <p>
                    {page === "login" ? "Don't have an account?" : "Already have an account?"}
                    <button
                        className="toggle-button"
                        onClick={() => setPage(page === "login" ? "register" : "login")}
                    >
                        {page === "login" ? "Register" : "Login"}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default LoginRegister;
