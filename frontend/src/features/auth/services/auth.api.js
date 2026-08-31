import axios from "axios"


const api = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true
})


// Register
export const registerUser = async (
    username,
    email,
    password
) => {

    const response = await api.post(
        "/auth/register",
        {
            username,
            email,
            password
        }
    )

    return response.data
}


// Login
export const loginUser = async (
    email,
    password
) => {

    const response = await api.post(
        "/auth/login",
        {
            email,
            password
        }
    )

    return response.data
}


// Logout
export const logoutUser = async () => {

    const response = await api.get(
        "/auth/logout"
    )

    return response.data
}


// Get current user
export const getMe = async () => {

    const response = await api.get(
        "/auth/get-me"
    )

    return response.data
}