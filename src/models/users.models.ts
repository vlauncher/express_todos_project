import { Schema, model, Document } from 'mongoose'
import { IProfile } from './profile.model'; 
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  first_name: string
  last_name: string
  email: string
  password: string
  profile: Schema.Types.ObjectId | IProfile
  verified: boolean

  // for both password reset & email verification
  resetCode?: string
  resetCodeExpires?: Date

  emailVerificationCode?: string
  emailVerificationExpires?: Date

  comparePassword: (candidatePassword: string) => Promise<boolean>
  hashPassword: () => Promise<string>
}

const UserSchema = new Schema<IUser>(
  {
    first_name: { type: String, required: true },
    last_name:  { type: String, required: true },
    email:      { type: String, required: true, unique: true, lowercase: true },
    password:   { type: String, required: true },
    profile:    { type: Schema.Types.ObjectId, ref: 'Profile' },
    verified:   { type: Boolean, default: false },

    // reuse resetCode fields for password reset
    resetCode:            { type: String, default: null },
    resetCodeExpires:     { type: Date,   default: null },

    // new fields for email OTP
    emailVerificationCode:    { type: String, default: null },
    emailVerificationExpires: { type: Date,   default: null },
  },
  { timestamps: true },
)

// password methods unchanged…
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password)
}
UserSchema.methods.hashPassword = async function () {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(this.password, salt)
}
UserSchema.pre<IUser>('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await this.hashPassword()
  }
  next()
})

export const User = model<IUser>('User', UserSchema)
