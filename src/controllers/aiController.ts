import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const detailLevels: Record<string, string> = {
  basic: "Provide a high-level overview with 3-4 architecture components and key tech choices.",
  standard:
    "Provide a comprehensive architecture with 4-5 components, tech stack details, database schema overview, and API endpoints.",
  detailed:
    "Provide an extremely detailed architecture with 5-7 components, full tech stack, database schema, API endpoints, folder structure, and a development roadmap.",
};

export async function generateBlueprint(req: Request, res: Response) {
  try {
    const { idea, detailLevel } = req.body;

    const prompt = `You are an expert software architect. Given a project idea, generate a complete architecture blueprint.

Project Idea: "${idea}"

${detailLevels[detailLevel] || detailLevels.standard}

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "title": "Project title",
  "description": "Brief 1-2 sentence description",
  "category": "One of: Web Apps, AI / ML, Cloud & DevOps, Mobile Apps, SaaS Platforms, Cybersecurity, Data Pipelines, UI Libraries",
  "techStack": {
    "frontend": "Primary frontend technology",
    "backend": "Primary backend technology",
    "database": "Primary database",
    "extras": ["Other technologies"]
  },
  "architecture": {
    "components": [
      {
        "name": "Component name",
        "description": "What this component does",
        "technologies": ["tech1", "tech2"],
        "keyFeatures": ["feature1", "feature2"]
      }
    ],
    "databaseSchema": "Description of the database schema design",
    "apiEndpoints": [
      { "method": "GET", "path": "/api/resource", "description": "What it does" }
    ],
    "folderStructure": {
      "root": ["folder1", "folder2"],
      "details": "Description of the folder organization"
    },
    "roadmap": ["Phase 1: ...", "Phase 2: ...", "Phase 3: ..."]
  }
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const cleaned = text.replace(/```json?/gi, "").replace(/```/g, "").trim();
    const blueprint = JSON.parse(cleaned);

    res.json({ success: true, data: blueprint });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate blueprint",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function chatAssistant(req: Request, res: Response) {
  try {
    const { prompt, history } = req.body;

    const chat = model.startChat({
      history: history.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      systemInstruction: {
        role: "user",
        parts: [
          {
            text: "You are DevArchify AI, an expert software architecture assistant. You help developers plan, structure, and design software projects. Be concise, technical, and practical. When suggesting architectures, provide specific technology recommendations and explain trade-offs.",
          },
        ],
      },
    });

    const result = await chat.sendMessageStream(prompt);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Chat error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
