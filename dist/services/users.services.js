"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const users_models_1 = require("../models/users.models");
const profile_model_1 = require("../models/profile.model");
;
const tokens_1 = require("../utils/tokens");
const emails_1 = require("../utils/emails");
class UserService {
    /**
     * Registers a new user.
     *
     * - Checks if a user with the provided email already exists.
     * - Creates and saves a new user.
     * - Generates an email verification token.
     * - Sends a verification email to the user.
     *
     * @param {Partial<IUser>} userData - The user data for registration.
     * @returns {Promise<IUser>} - The newly created user document.
     * @throws {Error} - If the email is already registered.
     */
    async register(userData) {
        if (!userData.first_name || !userData.last_name || !userData.email || !userData.password) {
            throw new Error('All fields are required');
        }
        const existing = await users_models_1.User.findOne({ email: userData.email });
        if (existing)
            throw new Error('Email already registered');
        const newUser = new users_models_1.User(userData);
        // generate a 6-digit email OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        newUser.emailVerificationCode = code;
        newUser.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
        await newUser.save();
        await (0, emails_1.sendEmailVerificationCode)(newUser.email, code);
        return newUser;
    }
    /**
     * Logs in a user.
     *
     * - Finds the user by email.
     * - Validates the password.
     * - Checks if the user's email is verified.
     * - Generates access and refresh tokens.
     *
     * @param {string} email - The user's email.
     * @param {string} password - The user's password.
     * @returns {Promise<{ user: IUser; access: string; refresh: string }>} - The user object and JWT tokens.
     * @throws {Error} - If email/password is invalid or email is not verified.
     */
    async login(email, password) {
        const user = await users_models_1.User.findOne({ email });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }
        if (!user.verified) {
            throw new Error('Email not verified');
        }
        const payload = { id: user._id, email: user.email };
        const access = (0, tokens_1.createAccessToken)(payload);
        const refresh = (0, tokens_1.createRefreshToken)(payload);
        return { user, access, refresh };
    }
    /**
     * Verifies a user's email using the verification token.
     *
     * - Decodes and verifies the token.
     * - Finds the user by the decoded id.
     * - Marks the user as verified.
     * - Sends a confirmation email.
     *
     * @param {string} token - The email verification token.
     * @returns {Promise<IUser>} - The updated user document.
     * @throws {Error} - If the token is invalid/expired or the user is not found.
     */
    async verifyEmail(code, email) {
        const user = await users_models_1.User.findOne({
            email,
            emailVerificationCode: code,
            emailVerificationExpires: { $gte: new Date() }
        });
        if (!user)
            throw new Error('Invalid or expired verification code');
        user.verified = true;
        user.emailVerificationCode = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();
        // optional: create Profile if none
        const exists = await profile_model_1.Profile.findOne({ user: user._id });
        if (!exists) {
            await profile_model_1.Profile.create({
                user: user._id,
                username: user.first_name,
                gender: 'male',
                address: ''
            });
        }
        await (0, emails_1.sendEmailVerificationSuccess)(user.email);
        return user;
    }
    /**
     * Generates a 6-digit code, stores it on the user with an expiration,
     * and sends the code via email.
     *
     * This method is called when a user requests a password reset.
     *
     * @param {string} email - The user's email.
     * @throws {Error} - If the user is not found.
     */
    async forgotPassword(email) {
        const user = await users_models_1.User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        // Generate a random 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        // Set expiration time (e.g., 5 minutes from now)
        const expiration = new Date(Date.now() + 5 * 60 * 1000);
        // Store the code and its expiration
        user.resetCode = code;
        user.resetCodeExpires = expiration;
        await user.save();
        // Send the code to the user via email
        await (0, emails_1.sendForgotPasswordCode)(user.email, code);
    }
    /**
     * Resets the password using only the 6-digit code.
     * The method looks up the user by the code, ensures the code is still valid,
     * updates the password, and clears the code and expiration.
     *
     * @param {string} code - The 6-digit code sent to the user.
     * @param {string} newPassword - The new password.
     * @param {string} confirmPassword - The new password confirmation.
     * @throws {Error} - If the code is invalid/expired or the passwords do not match.
     * @returns {Promise<IUser>} - The updated user document.
     */
    async resetPassword(code, newPassword, confirmPassword) {
        if (newPassword !== confirmPassword) {
            throw new Error('Passwords do not match');
        }
        // Find a user with the given code and ensure it is not expired
        const user = await users_models_1.User.findOne({
            resetCode: code,
            resetCodeExpires: { $gte: new Date() },
        });
        if (!user) {
            throw new Error('Invalid or expired reset code');
        }
        // check if the new password is the same as the old password
        if (newPassword === user.password) {
            throw new Error('New password cannot be the same as the old password');
        }
        // Update the password (the model pre-save hook will hash it)
        user.password = newPassword;
        // Clear the reset code and expiration to allow code reuse
        user.resetCode = undefined;
        user.resetCodeExpires = undefined;
        await user.save();
        // Send a confirmation email
        // (This function can remain as it is in your email utils)
        await (0, emails_1.sendResetPasswordConfirmation)(user.email);
        return user;
    }
    /**
     * Refreshes JWT tokens.
     *
     * - Verifies the provided refresh token.
     * - Finds the user by the decoded id.
     * - Generates new access and refresh tokens.
     *
     * @param {string} refreshToken - The refresh token.
     * @returns {Promise<{ accessToken: string; refreshToken: string }>} - New JWT tokens.
     * @throws {Error} - If the refresh token is invalid or the user is not found.
     */
    async refreshToken(refreshToken) {
        const decoded = (0, tokens_1.verifyToken)(refreshToken);
        if (!decoded) {
            throw new Error('Invalid refresh token');
        }
        const user = await users_models_1.User.findById(decoded.id);
        if (!user) {
            throw new Error('User not found');
        }
        const payload = { id: user._id, email: user.email };
        const newAccessToken = (0, tokens_1.createAccessToken)(payload);
        const newRefreshToken = (0, tokens_1.createRefreshToken)(payload);
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }
}
exports.UserService = UserService;
//# sourceMappingURL=users.services.js.map