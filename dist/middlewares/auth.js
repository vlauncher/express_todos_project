"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const tokens_1 = require("../utils/tokens");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ message: 'Authorization header missing' });
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Token missing' });
            return;
        }
        // Adjust the generic type to include role
        const decoded = (0, tokens_1.verifyToken)(token);
        if (!decoded) {
            res.status(401).json({ message: 'Invalid or expired token' });
            return;
        }
        // Attach the decoded data to req.user
        req.user = { id: decoded.id, email: decoded.email };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.js.map