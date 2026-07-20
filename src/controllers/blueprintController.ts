import { Request, Response } from "express";
import Blueprint from "../models/Blueprint";

export const getBlueprints = async (req: Request, res: Response) => {
  try {
    const { search, category, techStack, sort, page = "1", limit = "12" } = req.query;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { projectTitle: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (techStack) {
      filter["techStack.frontend"] = { $regex: techStack, $options: "i" };
    }

    const sortOption: Record<string, 1 | -1> =
      sort === "popular" ? { stars: -1 } : { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [blueprints, total] = await Promise.all([
      Blueprint.find(filter).sort(sortOption).skip(skip).limit(limitNum).populate("userId", "name email"),
      Blueprint.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: blueprints,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching blueprints", error });
  }
};

export const getBlueprintById = async (req: Request, res: Response) => {
  try {
    const blueprint = await Blueprint.findById(req.params.id).populate("userId", "name email");

    if (!blueprint) {
      res.status(404).json({ success: false, message: "Blueprint not found" });
      return;
    }

    res.json({ success: true, data: blueprint });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching blueprint", error });
  }
};

export const createBlueprint = async (req: Request, res: Response) => {
  try {
    const { title, description, category, techStack, architecture } = req.body;

    const newBlueprint = await Blueprint.create({
      projectTitle: title,
      description,
      category,
      userId: req.user!.id,
      techStack,
      architecture,
    });

    res.status(201).json({ success: true, data: newBlueprint });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving blueprint", error });
  }
};

export const deleteBlueprint = async (req: Request, res: Response) => {
  try {
    const blueprint = await Blueprint.findById(req.params.id);

    if (!blueprint) {
      res.status(404).json({ success: false, message: "Blueprint not found" });
      return;
    }

    const isOwner = blueprint.userId.toString() === req.user!.id;
    const isAdmin = req.user!.role === "admin";

    if (!isOwner && !isAdmin) {
      res.status(403).json({ success: false, message: "Not authorized to delete this blueprint" });
      return;
    }

    await Blueprint.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Blueprint deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting blueprint", error });
  }
};