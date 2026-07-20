import { generateContent } from "./openaiService.js";

const detailLevels: Record<string, string> = {
  basic:
    "Provide a high-level overview with 3-4 architecture components and key tech choices.",
  standard:
    "Provide a comprehensive architecture with 4-5 components, tech stack details, database schema overview, and API endpoints.",
  detailed:
    "Provide an extremely detailed architecture with 5-7 components, full tech stack, database schema, API endpoints, folder structure, and a development roadmap.",
};

const STRUCTURE_PROMPT = `Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
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

function buildBlueprintPrompt(idea: string, detailLevel: string): string {
  const level = detailLevels[detailLevel] || detailLevels.standard;
  return `You are an expert software architect. Given a project idea, generate a complete architecture blueprint.

Project Idea: "${idea}"

${level}

${STRUCTURE_PROMPT}`;
}

export async function generateBlueprint(idea: string, detailLevel: string) {
  const prompt = buildBlueprintPrompt(idea, detailLevel);
  const raw = await generateContent(prompt);
  const cleaned = raw.replace(/```json?/gi, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}
