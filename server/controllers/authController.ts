import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IUser, User } from "../models/User";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    const existing: IUser | null = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ error: "Email already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: IUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User created", user: newUser.username });
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.error("Unknown error", err);
      res.status(500).json({ error: "An unknown error occurred." });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Wrong password" });
      return;
    }

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    console.log("🍪 Setting refresh token cookie:", {
      token: refreshToken.substring(0, 20) + "...",
      length: refreshToken.length,
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 7 days in milliseconds
      sameSite: "lax",
      secure: false, // Set to true in production with HTTPS
    });

    console.log("🍪 Cookie set successfully");

    res.json({
      accessToken,
      user: { id: user._id, username: user.username },
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
    } else {
      console.error("Unknown error", err);
      res.status(500).json({ error: "An unknown error occurred." });
    }
  }
};

export const refreshLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("=== REFRESH ENDPOINT HIT ===");
  console.log("Request method:", req.method);
  console.log("Request headers:", req.headers);
  console.log("All cookies:", req.cookies);
  console.log("Refresh token exists:", !!req.cookies?.refresh_token);

  if (req.cookies?.refresh_token) {
    const refreshToken = req.cookies.refresh_token;
    console.log("Refresh token found, verifying...");

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing");
      throw new Error("JWT_SECRET is missing");
    }

    const JWT_SECRET: string = process.env.JWT_SECRET;

    jwt.verify(refreshToken, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        console.error("JWT verification failed:", err.message);
        return res.status(406).json({ message: "Unauthorized" });
      } else {
        console.log("JWT verification successful, decoded:", decoded);
        const { id } = decoded as jwt.JwtPayload;

        const accessToken = jwt.sign(
          { id: id },
          process.env.JWT_SECRET as string,
          { expiresIn: "1m" }
        );

        console.log("New access token generated");
        console.log("Sending response with accessToken");
        return res.json({ accessToken });
      }
    });
  } else {
    console.log("No refresh token found in cookies");
    console.log("Available cookies:", Object.keys(req.cookies || {}));
    res.status(406).json({ message: "Unauthorized" });
  }
};
