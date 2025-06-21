"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controllers_1 = require("../controllers/users.controllers");
const router = (0, express_1.Router)();
const ctrl = new users_controllers_1.UserController();
router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/verify-email', ctrl.verifyEmail);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);
router.post('/resend-reset-code', ctrl.resendCode);
router.post('/refreshToken', ctrl.refreshToken);
exports.default = router;
//# sourceMappingURL=users.routes.js.map