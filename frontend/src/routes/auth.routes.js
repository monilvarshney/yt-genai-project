import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";

const authRoutes = [
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    }
];

export default authRoutes;