import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { AuthController } from '../controllers/AuthController';
import { NoteController } from '../controllers/NoteController';
import { OpenApiController } from '../controllers/OpenApiController';

import { authenticateJWT, AuthRequest } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  registerSchema,
  loginSchema,
  createNoteSchema,
  updateNoteSchema,
  shareNoteSchema,
  noteIdParamSchema,
  searchSchema
} from '../middlewares/schemas';

const router = Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests from this IP, please try again after 15 minutes" }
});

// Authentication Routes
router.post('/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);

// Protected Note Routes
const notesRouter = Router();
notesRouter.use(authenticateJWT as any);

notesRouter.get('/', NoteController.getNotes as any);
notesRouter.post('/', validate(createNoteSchema), NoteController.createNote as any);
notesRouter.get('/:id', validate(noteIdParamSchema), NoteController.getNote as any);
notesRouter.put('/:id', validate(updateNoteSchema), NoteController.updateNote as any);
notesRouter.delete('/:id', validate(noteIdParamSchema), NoteController.deleteNote as any);
notesRouter.post('/:id/share', validate(shareNoteSchema), NoteController.shareNote as any);

router.use('/notes', notesRouter);

// Search
router.get('/search', authenticateJWT as any, validate(searchSchema), NoteController.searchNotes as any);

// OpenAPI
router.get('/openapi.json', OpenApiController.getSchema);

export default router;
