import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  conversation: IMessage[];
  createdAt: Date;
}

const chatHistorySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  conversation: [
    {
      role: { type: String, enum: ['user', 'assistant'], required: true },
      content: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const ChatHistory: Model<IChatHistory> = mongoose.model<IChatHistory>('ChatHistory', chatHistorySchema);
export default ChatHistory;
