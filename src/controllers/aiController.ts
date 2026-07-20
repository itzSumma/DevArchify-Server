import { Request, Response } from "express";
import {
  buildMessages,
  streamChatResponse,
} from "../services/openaiService.js";
import {
  appendToConversation,
  getHistory,
  deleteHistory,
  getUserBlueprintContext,
} from "../services/chatHistoryService.js";
import { generateBlueprint } from "../services/blueprintService.js";

export async function generateBlueprintHandler(req: Request, res: Response) {
  try {
    const { idea, detailLevel } = req.body;
    const data = await generateBlueprint(idea, detailLevel);
    res.json({ success: true, data });
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
    const userId = req.user!.id;

    const blueprintContext = await getUserBlueprintContext(userId);
    const augmentedPrompt = `[System: You are DevArchify AI, an expert software architecture assistant. Help developers plan, structure, and design software projects. Be concise, technical, and practical.]\n\n${prompt}\n\nContext from database:${blueprintContext}\n\nUse the above context to answer the user's question. If they ask about their blueprints, refer to the list above.`;

    const messages = buildMessages(history || []);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";
    for await (const text of streamChatResponse(messages, augmentedPrompt)) {
      fullResponse += text;
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    if (fullResponse) {
      await appendToConversation(userId, prompt, fullResponse);
    }
  } catch (error: any) {
    console.error("CHAT_ERROR:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "Unknown error" });
    }
  }
}

export async function getChatHistoryHandler(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const data = await getHistory(userId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function deleteChatHistoryHandler(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    await deleteHistory(userId);
    res.json({ success: true, message: "Chat history deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete chat history",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
