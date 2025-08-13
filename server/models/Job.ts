import mongoose, { Document, Schema } from "mongoose";

export interface IJob extends Document {
  company: string;
  position: string;
  status:
    | "pending"
    | "interviewing"
    | "declined"
    | "applied"
    | "offer"
    | "rejected";
  jobType: "full-time" | "part-time" | "remote" | "internship";
  location: string;
  createdBy: mongoose.Types.ObjectId;
}

const jobSchema = new Schema<IJob>(
  {
    company: { type: String, required: true },
    position: { type: String, required: true },
    status: {
      type: String,
      enum: ["applied", "declined", "interviewing", "offer", "rejected"],
      default: "pending",
    },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "remote", "internship"],
      default: "full-time",
    },
    location: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Job = mongoose.model<IJob>("Job", jobSchema);
