import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET!
const ACCESS_TOKEN_EXPIRES_IN = '45m'
const REFRESH_TOKEN_EXPIRES_IN = '7d'
const EMAIL_VERIFICATION_TOKEN_EXPIRES_IN = '1d'

interface TokenPayload {
  id?: string
  email: string
  role?: 'regular' | 'admin' | 'superadmin'
  code?: string
}

export const createAccessToken = (payload: TokenPayload): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN })

export const createRefreshToken = (payload: TokenPayload): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN })

export const createEmailVerificationToken = (payload: TokenPayload): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: EMAIL_VERIFICATION_TOKEN_EXPIRES_IN })


export const verifyToken = <T>(token: string): T | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as T
  } catch (error) {
    return null
  }
}