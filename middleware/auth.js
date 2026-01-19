const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || "unsafe_fallback_secret_change_me_in_prod";

if (!process.env.JWT_SECRET) {
    console.warn("⚠️  WARNING: JWT_SECRET is not defined. Using unsafe fallback.");
}

const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ success: false, message: "Access Denied: No Token Provided" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: "Access Denied: Invalid Token" });
        if (user.role !== 'admin') return res.status(403).json({ success: false, message: "Access Denied: Admins Only" });
        req.user = user;
        next();
    });
};

const authenticateUser = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: "Access Denied: No Token Provided" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: "Access Denied: Invalid Token" });
        req.user = user;
        next();
    });
};

module.exports = { authenticateAdmin, authenticateUser, JWT_SECRET };
