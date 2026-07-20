import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export interface JwtPayload {
  id: string;
  role: "user" | "admin";
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set in environment variables");
  return secret;
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : req.cookies?.auth_token;

  if (!token) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;

    const user = await User.findById(decoded.id).select("_id role");
    if (!user) {
      res.status(401).json({ success: false, message: "User no longer exists" });
      return;
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

export function authorizeRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: "Insufficient permissions" });
      return;
    }
    next();
  };
}
