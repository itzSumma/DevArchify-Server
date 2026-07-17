import { Request, Response } from "express";
import Blueprint from "../models/Blueprint";
 

export const createBlueprint = async (req: Request, res: Response) => {
  try {
    
    const { title, description, userId, architecture, techStack } = req.body;

   
    const newBlueprint = await Blueprint.create({
      projectTitle: title,
      description,
      userId,
      architecture,     
      techStack          
    });

    res.status(201).json({ success: true, data: newBlueprint });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving blueprint", error });
  }
};