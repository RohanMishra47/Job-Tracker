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
      type: Schema.Types.Mixed, // Allows both number and array
      validate: {
        validator: function (value: any) {
          if (!value) return true; // Allow undefined/null
          if (typeof value === "number") return value >= 0;
          if (Array.isArray(value)) {
            return (
              value.length === 2 &&
              typeof value[0] === "number" &&
              typeof value[1] === "number" &&
              value[0] >= 0 &&
              value[1] >= 0 &&
              value[0] <= value[1]
            );
          }
          return false;
        },
        message:
          "Salary must be a positive number or an array of two positive numbers [min, max] where min <= max",
      },
      required: false,
    },
    experienceLevel: {
      type: String,
      enum: ["junior", "mid", "senior"],
      required: false,
    },
    tags: { type: [String], required: false },
    applicationLink: {
      type: String,
      required: false,
      validate: {
        validator: function (value: string) {
          // Allow empty string, null, or undefined
          if (!value) return true;
          // Validate URL format if value exists
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },
    deadline: { type: Date, required: false },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      required: false,
    },
    source: {
      type: String,
      required: false,
    },
    notes: { type: String, required: false },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Job = mongoose.model<IJob>("Job", jobSchema);
