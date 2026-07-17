import mongoose, { Document } from "mongoose";

export interface IBlueprint extends Document {
  title: string;
  description: string;
  userId: mongoose.Types.ObjectId;
  technicalDetails?: object;
}

const BlueprintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technicalDetails: { type: Object },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

export const Blueprint = mongoose.models.Blueprint || mongoose.model<IBlueprint>('Blueprint', BlueprintSchema);