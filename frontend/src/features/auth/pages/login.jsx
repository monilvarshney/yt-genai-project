import React, { useState } from "react";
import "../auth.form.scss";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

const Login = () => {
    const { handleLogin, loading } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            // FIX: Removed the curly braces so they are passed as separate arguments
            await handleLogin(email, password);

            navigate("/");
        } catch (error) {
            console.error("Login failed:", error);
            setError(
                error.response?.data?.message ||
                "Invalid email or password"
            );
        }
    };

    return (
        <main>
            <div className="auth-container">
                <h1>Login</h1>

                {error && (
                    <p style={{ color: "red" }}>
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        className="button primary-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p>
                    Don't have an account?{" "}
                    <Link to="/register">Register</Link>
                </p>
            </div>
        </main>
    );
};

export default Login;