import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const GOOGLE_TOKEN_INFO = "https://oauth2.googleapis.com/tokeninfo";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set in environment variables");
  return secret;
}

function signToken(userId: string, role: string) {
  return jwt.sign({ id: userId, role }, getJwtSecret(), {
    expiresIn: "7d",
  });
}

export async function login(req: Request, res: Response) {
  try {
    console.log("[LOGIN] req.body:", req.body);
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    console.log("[LOGIN] user found:", !!user);
    console.log("DEBUG_USER_DATA:", user);

    if (!user) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }

    if (!user.password) {
      console.log("LOGIN_ERROR: User password field is undefined in DB");
      res.status(400).json({ success: false, message: "User password field is undefined in DB" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("[LOGIN] bcrypt match:", isMatch);

    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }

    const token = signToken(user._id.toString(), user.role);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        },
      },
    });
  } catch (error) {
    console.error("[LOGIN] error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ success: false, message: "Email already registered" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword, role: "user" });
    const token = signToken(user._id.toString(), user.role);
    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, image: user.image },
      },
    });
  } catch (error) {
    console.error("[REGISTER] error:", error);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
}

export async function googleLogin(req: Request, res: Response) {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      res.status(400).json({ success: false, message: "idToken is required" });
      return;
    }

    const verifyRes = await fetch(`${GOOGLE_TOKEN_INFO}?id_token=${idToken}`);
    if (!verifyRes.ok) {
      res.status(401).json({ success: false, message: "Invalid Google token" });
      return;
    }

    const payload = await verifyRes.json() as {
      sub: string; email: string; name: string; picture?: string; aud: string;
    };

    const expectedAud = process.env.GOOGLE_CLIENT_ID;
    if (expectedAud && payload.aud !== expectedAud) {
      res.status(401).json({ success: false, message: "Token audience mismatch" });
      return;
    }

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        image: payload.picture || "",
        password: "",
        role: "user",
      });
    }

    const token = signToken(user._id.toString(), user.role);
    res.json({
      success: true,
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, image: user.image },
      },
    });
  } catch (error) {
    console.error("[GOOGLE LOGIN] error:", error);
    res.status(401).json({ success: false, message: "Google authentication failed" });
  }
}

export async function betterAuthExchange(req: Request, res: Response) {
  try {
    const { email, name, image } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: "Email is required" });
      return;
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        image: image || "",
        password: "",
        role: "user",
      });
    }

    const token = signToken(user._id.toString(), user.role);
    res.json({
      success: true,
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, image: user.image },
      },
    });
  } catch (error) {
    console.error("[BETTER-AUTH EXCHANGE] error:", error);
    res.status(500).json({ success: false, message: "Exchange failed" });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const user = await User.findById(req.user!.id).select("-password");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role, image: user.image },
    });
  } catch (error) {
    console.error("[GETME] error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
}
