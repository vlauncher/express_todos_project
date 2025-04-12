import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/users.services';

export class UserController {
  private userService = new UserService();

  /**
   * Controller endpoint to register a new user.
   * 
   * - Invokes the register service method.
   * - Returns the newly created user with a success message.
   *
   * @param {Request} req - Express request object containing user data.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   */
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.register(req.body);
      res.status(201).json({ message: 'Signup successful', user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Controller endpoint to log in a user.
   * 
   * - Invokes the login service method.
   * - Returns the user object along with access and refresh tokens.
   *
   * @param {Request} req - Express request object containing email and password.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   */
  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const data = await this.userService.login(email, password);
      res.status(200).json({ message: 'Login successful', ...data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Controller endpoint to verify a user's email.
   * 
   * - Extracts the verification token from the URL parameters.
   * - Invokes the verifyEmail service method.
   * - Returns the verified user with a success message.
   *
   * @param {Request} req - Express request object containing the token parameter.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   */
  public verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.params;
      const user = await this.userService.verifyEmail(token);
      res.status(200).json({ message: 'Email verified successfully', user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Controller endpoint to send a password reset code to a user's email.
   * 
   * - Invokes the forgotPassword service method.
   * - Returns a success message with no data.
   *
   * @param {Request} req - Express request object containing the user's email.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   */
  public forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body
      await this.userService.forgotPassword(email)
      res.status(200).json({ message: 'Reset code sent to email' })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Controller endpoint to reset a user's password using the reset code.
   * 
   * - Invokes the resetPassword service method.
   * - Returns the updated user with a success message.
   *
   * @param {Request} req - Express request object containing the code, newPassword, and confirmPassword.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   */
  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code, newPassword, confirmPassword } = req.body
      const user = await this.userService.resetPassword(code, newPassword, confirmPassword)
      res.status(200).json({ message: 'Password reset successful', user })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Controller endpoint to resend the password reset code.
   * 
   * - Invokes the forgotPassword service method.
   * - Returns a success message with no data.
   *
   * @param {Request} req - Express request object containing the user's email.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   */
  public resendCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      await this.userService.forgotPassword(email);
      res.status(200).json({ message: 'New reset code sent to email' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Controller endpoint to refresh JWT tokens.
   * 
   * - Invokes the refreshToken service method.
   * - Returns new access and refresh tokens with a success message.
   *
   * @param {Request} req - Express request object containing the refresh token.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   */
  public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.userService.refreshToken(refreshToken);
      res.status(200).json({ message: 'Token refreshed', ...tokens });
    } catch (error) {
      next(error);
    }
  }
}