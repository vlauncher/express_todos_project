import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/tokens'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    [key: string]: any
  }
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      res.status(401).json({ message: 'Authorization header missing' })
      return
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      res.status(401).json({ message: 'Token missing' })
      return
    }

    // Adjust the generic type to include role
    const decoded = verifyToken<{ id: string; email: string; }>(token)
    if (!decoded) {
      res.status(401).json({ message: 'Invalid or expired token' })
      return
    }

    // Attach the decoded data to req.user
    req.user = { id: decoded.id, email: decoded.email }
    next()
  } catch (error) {
    next(error)
  }
}
