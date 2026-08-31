import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";

import {
    registerUser,
    loginUser,
    logoutUser,
    getMe
} from "../services/auth.api";

const useAuth = () => {

    const {
        user,
        setUser,
        loading,
        setLoading
    } = useContext(AuthContext);


    // =========================
    // REGISTER
    // =========================
    const handleRegister = async (username, email, password) => {
        try {
            setLoading(true);

            const data = await registerUser(
                username,
                email,
                password
            );

            setUser(data.user);

            return data;

        } catch (error) {
            console.error(
                "Register error:",
                error.response?.data || error.message
            );

            throw error;

        } finally {
            setLoading(false);
        }
    };


    // =========================
    // LOGIN
    // =========================
    const handleLogin = async (email, password) => {
        try {
            setLoading(true);

            const data = await loginUser(
                email,
                password
            );

            setUser(data.user);

            return data;

        } catch (error) {
            console.error(
                "Login error:",
                error.response?.data || error.message
            );

            throw error;

        } finally {
            setLoading(false);
        }
    };


    // =========================
    // LOGOUT
    // =========================
    const handleLogout = async () => {
        try {
            setLoading(true);

            await logoutUser();

            setUser(null);

        } catch (error) {
            console.error(
                "Logout error:",
                error.response?.data || error.message
            );

            throw error;

        } finally {
            setLoading(false);
        }
    };


    // =========================
    // GET CURRENT USER
    // =========================
    useEffect(() => {

        const fetchUser = async () => {

            try {
                const data = await getMe();

                setUser(data.user);

            } catch (error) {

                // User is simply not logged in
                setUser(null);

            } finally {

                setLoading(false);

            }
        };

        fetchUser();

    }, []);


    return {
        user,
        loading,
        handleRegister,
        handleLogin,
        handleLogout
    };
};

export default useAuth;