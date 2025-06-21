"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profile = void 0;
const mongoose_1 = require("mongoose");
const ProfileSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true, nullable: true },
    gender: { type: String, enum: ['male', 'female'], nullable: true },
    address: { type: String, default: '', nullable: true },
    profile_picture: { type: String, default: '', nullable: true },
}, { timestamps: true });
exports.Profile = (0, mongoose_1.model)('Profile', ProfileSchema);
//# sourceMappingURL=profile.model.js.map