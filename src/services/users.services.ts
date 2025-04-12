import { User, IUser } from '../models/users.models';
import { Profile } from '../models/profile.model';;
import { 
  createAccessToken, 
  createRefreshToken, 
  createEmailVerificationToken, 
  verifyToken,
} from '../utils/tokens';
import { 
  sendEmailVerification, 
  sendForgotPasswordCode, 
  sendResetPasswordConfirmation, 
  sendEmailVerificationSuccess 
} from '../utils/emails';

export class UserService {

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
  public async register(userData: Partial<IUser>): Promise<IUser> {
    if(!userData.first_name || !userData.last_name || !userData.email || !userData.password){
      throw new Error('All fields are required');
    }
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('Email already registered');
    }
    const newUser: any = new User(userData);
    await newUser.save();

    const emailToken = createEmailVerificationToken({ id: newUser._id, email: newUser.email });
    console.log('Email verification token:', emailToken);
    await sendEmailVerification(newUser.email, emailToken);
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
  public async login(email: string, password: string): Promise<{ user: IUser; access: string; refresh: string }> {
    const user = await User.findOne({ email });
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
    const payload: any = { id: user._id, email: user.email };
    const access = createAccessToken(payload);
    const refresh = createRefreshToken(payload);
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
  public async verifyEmail(token: string): Promise<IUser> {
    const decoded = verifyToken<{ id: string; email: string }>(token);
    if (!decoded) {
      throw new Error('Invalid or expired token');
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }
    if (user.verified) {
      throw new Error('Email already verified');
    }
    user.verified = true;
    await user.save();
    await sendEmailVerificationSuccess(user.email);
    // Create a profile for the user if one does not exist
    const existingProfile = await Profile.findOne({ user: user._id });
    if (!existingProfile) {
      await Profile.create({
        user: user._id,
        username: user.first_name, // default username can be adjusted
        gender: 'male', // or derive from user data if available
        address: '',
      });
    }
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
  public async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email })
    if (!user) {
      throw new Error('User not found')
    }

    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Set expiration time (e.g., 5 minutes from now)
    const expiration = new Date(Date.now() + 5 * 60 * 1000)

    // Store the code and its expiration
    user.resetCode = code
    user.resetCodeExpires = expiration
    await user.save()

    // Send the code to the user via email
    await sendForgotPasswordCode(user.email, code)
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
  public async resetPassword(
    code: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<IUser> {
    if (newPassword !== confirmPassword) {
      throw new Error('Passwords do not match')
    }

    // Find a user with the given code and ensure it is not expired
    const user = await User.findOne({
      resetCode: code,
      resetCodeExpires: { $gte: new Date() },
    })

    if (!user) {
      throw new Error('Invalid or expired reset code')
    }

    // check if the new password is the same as the old password
    if (newPassword === user.password) {
      throw new Error('New password cannot be the same as the old password')
    }

    // Update the password (the model pre-save hook will hash it)
    user.password = newPassword

    // Clear the reset code and expiration to allow code reuse
    user.resetCode = undefined
    user.resetCodeExpires = undefined

    await user.save()

    // Send a confirmation email
    // (This function can remain as it is in your email utils)
    await sendResetPasswordConfirmation(user.email)

    return user
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
  public async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const decoded = verifyToken<{ id: string; email: string }>(refreshToken);
    if (!decoded) {
      throw new Error('Invalid refresh token');
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }
    const payload: any = { id: user._id, email: user.email };
    const newAccessToken = createAccessToken(payload);
    const newRefreshToken = createRefreshToken(payload);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}