import { Router } from 'express';
import { UserController } from '../controllers/users.controllers';

const router = Router();
const userController = new UserController();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/verify-email/:token', userController.verifyEmail);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.post('/resend-reset-code', userController.resendCode);
router.post('/refreshToken', userController.refreshToken);

export default router;