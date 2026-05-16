import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  title: string;
  content: string;
  ownerId: mongoose.Types.ObjectId;
  sharedWith: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [{ type: String }],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Create a text index on title and content for text search queries
noteSchema.index({ title: 'text', content: 'text' });
// Index on tags for faster filtering
noteSchema.index({ tags: 1 });
// Index on ownerId for retrieving user's notes faster
noteSchema.index({ ownerId: 1 });

export const Note = mongoose.model<INote>('Note', noteSchema);
