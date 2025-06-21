import { Router } from 'express';
import { UserController } from '../controllers/users.controllers';

const router = Router();
const ctrl = new UserController();

router.post('/register',         ctrl.register);
router.post('/login',            ctrl.login);
router.post('/verify-email',     ctrl.verifyEmail);
router.post('/forgot-password',  ctrl.forgotPassword);
router.post('/reset-password',   ctrl.resetPassword);
router.post('/resend-reset-code',ctrl.resendCode);
router.post('/refreshToken',     ctrl.refreshToken);

export default router;
