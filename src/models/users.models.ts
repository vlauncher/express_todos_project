// models/users.models.ts
import { Schema, model, Document } from 'mongoose'
import { IProfile } from './profile.model'; 
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  first_name: string
  last_name: string
  email: string
  password: string
  profile: Schema.Types.ObjectId | IProfile;
  verified: boolean
  resetCode?: string       // 6-digit code
  resetCodeExpires?: Date  // Expiration time for the code
  comparePassword: (candidatePassword: string) => Promise<boolean>
  hashPassword: () => Promise<string>
}

const UserSchema = new Schema<IUser>(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
    verified: { type: Boolean, default: false },
    resetCode: { type: String, default: null },
    resetCodeExpires: { type: Date, default: null },
  },
  { timestamps: true },
)

// Instance method: Compare candidate password with hashed password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Instance method: Hash password before saving/updating
UserSchema.methods.hashPassword = async function (): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(this.password, salt)
}

// Pre-save hook to hash password if modified
UserSchema.pre<IUser>('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await this.hashPassword()
  }
  next()
})

export const User = model<IUser>('User', UserSchema)