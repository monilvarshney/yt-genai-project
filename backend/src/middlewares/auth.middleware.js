const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

async function authUser(req, res, next) {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized. Please login."
            });
        }

        const blacklistedToken = await tokenBlacklistModel.findOne({
            token
        });

        if (blacklistedToken) {
            return res.status(401).json({
                message: "Token is blacklisted."
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        console.error("Auth Middleware Error:", error.message);

        return res.status(401).json({
            message: "Unauthorized. Invalid or expired token."
        });
    }
}

module.exports = {
    authUser
};