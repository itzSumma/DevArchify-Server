import mongoose, { Schema, Document, Model } from 'mongoose';

// ১. একটি ইন্টারফেস তৈরি করো (TypeScript-এর জন্য)
export interface IBlueprint extends Document {
  userId: mongoose.Types.ObjectId;
  projectTitle: string;
  description?: string;
  architecture: {
    features: string[];
    databaseSchema: object;
    apiList: object[];
    folderStructure: object;
    roadmap: string[];
  };
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    extras: string[];
  };
  createdAt: Date;
}

// ২. স্কিমা ডিফাইন করো
const blueprintSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  projectTitle: { type: String, required: true },
  description: { type: String },
  architecture: {
    features: [String],
    databaseSchema: Object,
    apiList: [Object],
    folderStructure: Object,
    roadmap: [String]
  },
  techStack: {
    frontend: String,
    backend: String,
    database: String,
    extras: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

// ৩. মডেল এক্সপোর্ট করো
const Blueprint: Model<IBlueprint> = mongoose.model<IBlueprint>('Blueprint', blueprintSchema);
export default Blueprint;