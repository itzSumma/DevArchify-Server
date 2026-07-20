import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export function validate(schema: ZodSchema, source: "body" | "params" | "query" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log("[VALIDATE] Validating request body:", JSON.stringify(req.body));

    try {
      const data = schema.parse(req[source]);
      console.log("[VALIDATE] Validation passed");
      req[source] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.log("[VALIDATE] Validation failed:", JSON.stringify(error.issues));
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
}
