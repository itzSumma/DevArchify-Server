import { z } from "zod";

export const updateUserRoleSchema = z.object({
  role: z.enum({ user: "user", admin: "admin" }),
});

export const userIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
});
