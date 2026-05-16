import { Request, Response, NextFunction } from 'express';
import { NoteService } from '../services/NoteService';
import { AuthRequest } from '../middlewares/auth';

export class NoteController {
  static async getNotes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const tag = req.query.tag as string;

      const result = await NoteService.getNotes(userId, userEmail, page, limit, tag);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      const { id } = req.params;

      const note = await NoteService.getNoteById(id, userId, userEmail);
      res.status(200).json(note);
    } catch (error) {
      next(error);
    }
  }

  static async createNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { title, content, tags } = req.body;

      const note = await NoteService.createNote(userId, title, content, tags);
      res.status(201).json(note);
    } catch (error) {
      next(error);
    }
  }

  static async updateNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const updates = req.body;

      const note = await NoteService.updateNote(id, userId, updates);
      res.status(200).json(note);
    } catch (error) {
      next(error);
    }
  }

  static async deleteNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await NoteService.deleteNote(id, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async shareNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { share_with_email } = req.body;

      const note = await NoteService.shareNote(id, userId, share_with_email);
      res.status(200).json({ message: 'Note shared successfully', note });
    } catch (error) {
      next(error);
    }
  }

  static async searchNotes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      const { q } = req.query;

      const notes = await NoteService.searchNotes(userId, userEmail, q as string);
      res.status(200).json(notes);
    } catch (error) {
      next(error);
    }
  }
}
