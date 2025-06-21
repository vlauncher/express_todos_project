"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.createEmailVerificationToken = exports.createRefreshToken = exports.createAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = '45m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';
const EMAIL_VERIFICATION_TOKEN_EXPIRES_IN = '1d';
const createAccessToken = (payload) => jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
exports.createAccessToken = createAccessToken;
const createRefreshToken = (payload) => jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
exports.createRefreshToken = createRefreshToken;
const createEmailVerificationToken = (payload) => jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: EMAIL_VERIFICATION_TOKEN_EXPIRES_IN });
exports.createEmailVerificationToken = createEmailVerificationToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=tokens.js.map