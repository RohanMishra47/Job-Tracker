import { body } from "express-validator";

export const jobValidators = [
  // Required string fields
  body("company").trim().notEmpty().withMessage("Company is required"),

  body("position")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Position must be at least 3 characters"),

  body("location").trim().notEmpty().withMessage("Location is required"),

  // Enums
  body("status")
    .optional()
    .isIn([
      "pending",
      "applied",
      "declined",
      "interviewing",
      "offer",
      "rejected",
    ])
    .withMessage("Invalid status"),

  body("jobType")
    .optional()
    .isIn(["full-time", "part-time", "remote", "internship"])
    .withMessage("Invalid job type"),

  body("experienceLevel")
    .optional()
    .isIn(["junior", "mid", "senior"])
    .withMessage("Invalid experience level"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),

  body("source")
    .optional()
    .isIn(["LinkedIn", "Referral", "Company Site", "other"])
    .withMessage("Invalid source"),

  // Salary: number or [min, max]
  body("salary")
    .optional()
    .custom((value) => {
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
    })
    .withMessage(
      "Salary must be a positive number or [min, max] where min <= max"
    ),

  // Tags: array of strings
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((arr) => arr.every((tag: any) => typeof tag === "string"))
    .withMessage("All tags must be strings"),

  // Deadline: valid date
  body("deadline")
    .optional()
    .isISO8601()
    .withMessage("Deadline must be a valid date"),

  // Application link: optional URL
  body("applicationLink")
    .optional({ nullable: true, checkFalsy: true })
    .isURL()
    .withMessage("Application link must be a valid URL"),

  // Notes: optional string
  body("notes").optional().isString().withMessage("Notes must be a string"),

  // isFavorite: optional boolean
  body("isFavorite")
    .optional()
    .isBoolean()
    .withMessage("isFavorite must be true or false"),
];
