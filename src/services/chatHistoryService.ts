import ChatHistory, { IMessage } from "../models/ChatHistory.js";
import Blueprint from "../models/Blueprint.js";

export async function appendToConversation(
  userId: string,
  userMsg: string,
  assistantMsg: string
) {
  const newUserMsg: IMessage = { role: "user", content: userMsg };
  const newAssistantMsg: IMessage = { role: "assistant", content: assistantMsg };

  const existing = await ChatHistory.findOne({ userId });
  if (existing) {
    existing.conversation.push(newUserMsg, newAssistantMsg);
    await existing.save();
  } else {
    await ChatHistory.create({
      userId,
      conversation: [newUserMsg, newAssistantMsg],
    });
  }
}

export async function getHistory(userId: string) {
  const chat = await ChatHistory.findOne({ userId }).sort({ createdAt: -1 });
  return chat?.conversation ?? [];
}

export async function deleteHistory(userId: string) {
  await ChatHistory.deleteMany({ userId });
}

export async function getUserBlueprintContext(userId: string): Promise<string> {
  try {
    const userBlueprints = await Blueprint.find({ userId }).limit(5).lean();
    if (userBlueprints.length === 0) {
      return "\n\nThe user has no saved blueprints yet.";
    }
    const summary = userBlueprints
      .map(
        (b) =>
          `- ${b.projectTitle} (${b.category || "uncategorized"}): ${b.description || "no description"}`
      )
      .join("\n");
    return `\n\nThe user has these saved blueprints:\n${summary}`;
  } catch {
    return "\n\nThe user has no saved blueprints yet.";
  }
}
