import { Note } from '../models/Note';
import mongoose from 'mongoose';

export class NoteService {
  static async getNotes(userId: string, userEmail: string, page: number = 1, limit: number = 10, tag?: string) {
    const query: any = {
      $or: [
        { ownerId: new mongoose.Types.ObjectId(userId) },
        { sharedWith: userEmail }
      ]
    };
    if (tag) {
      query.tags = tag;
    }

    const skip = (page - 1) * limit;
    const notes = await Note.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Note.countDocuments(query);

    return {
      data: notes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getNoteById(noteId: string, userId: string, userEmail: string) {
    const note = await Note.findById(noteId);
    if (!note) {
      const error: any = new Error('Note not found');
      error.status = 404;
      throw error;
    }

    const isOwner = note.ownerId.toString() === userId;
    const isShared = note.sharedWith.includes(userEmail);

    if (!isOwner && !isShared) {
      const error: any = new Error('Forbidden: You do not have access to this note');
      error.status = 403;
      throw error;
    }

    return note;
  }

  static async createNote(userId: string, title: string, content: string, tags: string[] = []) {
    const note = new Note({
      title,
      content,
      ownerId: new mongoose.Types.ObjectId(userId),
      tags
    });
    await note.save();
    return note;
  }

  static async updateNote(noteId: string, userId: string, updates: { title?: string, content?: string, tags?: string[] }) {
    const note = await Note.findById(noteId);
    if (!note) {
      const error: any = new Error('Note not found');
      error.status = 404;
      throw error;
    }

    if (note.ownerId.toString() !== userId) {
      const error: any = new Error('Forbidden: Only the owner can update this note');
      error.status = 403;
      throw error;
    }

    if (updates.title !== undefined) note.title = updates.title;
    if (updates.content !== undefined) note.content = updates.content;
    if (updates.tags !== undefined) note.tags = updates.tags;

    await note.save();
    return note;
  }

  static async deleteNote(noteId: string, userId: string) {
    const note = await Note.findById(noteId);
    if (!note) {
      const error: any = new Error('Note not found');
      error.status = 404;
      throw error;
    }

    if (note.ownerId.toString() !== userId) {
      const error: any = new Error('Forbidden: Only the owner can delete this note');
      error.status = 403;
      throw error;
    }

    await note.deleteOne();
  }

  static async shareNote(noteId: string, userId: string, shareWithEmail: string) {
    const note = await Note.findById(noteId);
    if (!note) {
      const error: any = new Error('Note not found');
      error.status = 404;
      throw error;
    }

    if (note.ownerId.toString() !== userId) {
      const error: any = new Error('Forbidden: Only the owner can share this note');
      error.status = 403;
      throw error;
    }

    if (!note.sharedWith.includes(shareWithEmail)) {
      note.sharedWith.push(shareWithEmail);
      await note.save();
    }

    return note;
  }

  static async searchNotes(userId: string, userEmail: string, query: string) {
    const notes = await Note.find({
      $text: { $search: query },
      $or: [
        { ownerId: new mongoose.Types.ObjectId(userId) },
        { sharedWith: userEmail }
      ]
    }).sort({ score: { $meta: 'textScore' } });

    return notes;
  }
}
