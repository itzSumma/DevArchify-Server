import { z } from "zod";

export const generateBlueprintSchema = z.object({
  idea: z.string().min(10, "Idea must be at least 10 characters").max(5000),
  detailLevel: z.enum({ basic: "basic", standard: "standard", detailed: "detailed" }).default("standard"),
});

export const chatSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty").max(10000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      })
    )
    .optional()
    .default([]),
});
