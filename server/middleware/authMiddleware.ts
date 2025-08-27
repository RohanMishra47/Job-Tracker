import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

console.log("JWT_SECRET (file load):", process.env.JWT_SECRET);

export const protect = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("JWT_SECRET (runtime):", process.env.JWT_SECRET);
  console.log("Headers received:", req.headers);
  const token = req.headers.authorization?.split(" ").pop();
  console.log("Token extracted:", token);
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    if (!token || token === "undefined") {
      return res.status(401).json({ message: "No token provided" });
    }
  }
};
