import { Schema, model, Document } from 'mongoose'

export interface IProfile extends Document {
  user: Schema.Types.ObjectId
  username: string
  gender: string
  address: string
  profile_picture?: string
}

const ProfileSchema = new Schema<IProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true,nullable: true },
    gender: { type: String, enum: ['male', 'female'],nullable: true },
    address: { type: String, default: '',nullable: true },
    profile_picture: { type: String, default: '',nullable: true },
  },
  { timestamps: true },
)

export const Profile = model<IProfile>('Profile', ProfileSchema)