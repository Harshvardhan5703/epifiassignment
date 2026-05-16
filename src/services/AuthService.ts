import { User } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
  static async register(email: string, passwordRaw: string) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error: any = new Error('Email is already registered');
      error.status = 409; // Conflict
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(passwordRaw, salt);

    const user = new User({ email, password });
    await user.save();
    return { id: user._id, email: user.email };
  }

  static async login(email: string, passwordRaw: string) {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      const error: any = new Error('Invalid email or password');
      error.status = 401; // Unauthorized
      throw error;
    }

    const isMatch = await bcrypt.compare(passwordRaw, user.password);
    if (!isMatch) {
      const error: any = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    const secret = process.env.JWT_SECRET || 'YOUR_SUPER_SECRET_KEY';
    const access_token = jwt.sign(
      { id: user._id, email: user.email },
      secret,
      { expiresIn: '1d' }
    );

    return { access_token };
  }
}
