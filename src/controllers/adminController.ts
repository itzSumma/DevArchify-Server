import { Request, Response } from "express";
import { User } from "../models/User.js";
import Blueprint from "../models/Blueprint.js";

export const getStats = async (_req: Request, res: Response) => {
  try {
    const [totalBlueprints, totalUsers, pendingBlueprints] = await Promise.all([
      Blueprint.countDocuments(),
      User.countDocuments(),
      Blueprint.countDocuments({ status: "pending" }),
    ]);

    res.json({
      success: true,
      data: {
        totalBlueprints,
        totalUsers,
        pendingBlueprints,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching stats", error });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating user role", error });
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users", error });
  }
};
