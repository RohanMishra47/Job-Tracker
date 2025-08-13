import { Document, ObjectId, Schema, model } from "mongoose";

export interface IUser extends Document {
  _id: ObjectId;
  username: string;
  email: string;
  password: string;
}

// Create the schema using typed fields
const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Export the model with IUser interface
export const User = model<IUser>("User", userSchema);
