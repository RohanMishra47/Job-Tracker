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
  description?: string;
  salary?: number | [number, number]; // Can be a single number or a range
  experienceLevel?: "junior" | "mid" | "senior";
  tags?: string[];
  applicationLink?: string;
  deadline?: Date;
  priority?: "low" | "medium" | "high" | number; // Can be an enum or a number
  source?: "LinkedIn" | "Referral" | "Company Site" | "other" | string; // Extendable enum
  notes?: string;
  isFavorite?: boolean;
}

const jobSchema = new Schema<IJob>(
  {
    company: { type: String, required: true },
    position: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "applied",
        "declined",
        "interviewing",
        "offer",
        "rejected",
      ],
      default: "pending",
    },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "remote", "internship"],
      default: "full-time",
    },
    location: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: false },
    salary: {
      type: [Number], // Array of numbers to support ranges
      validate: {
        validator: (value: number | [number, number]) => {
          if (Array.isArray(value)) {
            return value.length === 2 && value[0] <= value[1];
          }
          return true;
        },
        message:
          "Salary range must be an array of two numbers where the first is less than or equal to the second.",
      },
      required: false,
      min: 0,
    },
    experienceLevel: {
      type: String,
      enum: ["junior", "mid", "senior"],
      required: false,
    },
    tags: { type: [String], required: false },
    applicationLink: { type: String, required: false },
    deadline: { type: Date, required: false },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      required: false,
    },
    source: {
      type: String,
      enum: ["LinkedIn", "Referral", "Company Site", "other"],
      required: false,
    },
    notes: { type: String, required: false },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Job = mongoose.model<IJob>("Job", jobSchema);
