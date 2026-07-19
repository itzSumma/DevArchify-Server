import { z } from "zod";

export const createBlueprintSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000).optional(),
  category: z.string().min(1, "Category is required"),
  techStack: z.object({
    frontend: z.string().optional(),
    backend: z.string().optional(),
    database: z.string().optional(),
    extras: z.array(z.string()).optional(),
  }).optional(),
  architecture: z.object({
    features: z.array(z.string()).optional(),
    databaseSchema: z.any().optional(),
    apiList: z.array(z.any()).optional(),
    folderStructure: z.any().optional(),
    roadmap: z.array(z.string()).optional(),
  }).optional(),
});

export const updateBlueprintSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  category: z.string().optional(),
  techStack: z.object({
    frontend: z.string().optional(),
    backend: z.string().optional(),
    database: z.string().optional(),
    extras: z.array(z.string()).optional(),
  }).optional(),
  architecture: z.object({
    features: z.array(z.string()).optional(),
    databaseSchema: z.any().optional(),
    apiList: z.array(z.any()).optional(),
    folderStructure: z.any().optional(),
    roadmap: z.array(z.string()).optional(),
  }).optional(),
});

export const blueprintIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid blueprint ID"),
});
