"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    profile: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Profile' },
    verified: { type: Boolean, default: false },
    // reuse resetCode fields for password reset
    resetCode: { type: String, default: null },
    resetCodeExpires: { type: Date, default: null },
    // new fields for email OTP
    emailVerificationCode: { type: String, default: null },
    emailVerificationExpires: { type: Date, default: null },
}, { timestamps: true });
// password methods unchanged…
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
UserSchema.methods.hashPassword = async function () {
    const salt = await bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(this.password, salt);
};
UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await this.hashPassword();
    }
    next();
});
exports.User = (0, mongoose_1.model)('User', UserSchema);
//# sourceMappingURL=users.models.js.map