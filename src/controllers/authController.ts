import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Otp from '../models/Otp';
import { generateToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/apiResponse';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, password, role } = req.body;

        // Security Check: Only Admins can create non-customer roles
        if (role && role !== 'customer') {
            let token;
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                token = req.headers.authorization.split(' ')[1];
            }

            if (!token) {
                return sendError(res, 'Not authorized to create admin/staff accounts. Admin Token required.', 401);
            }

            try {
                // Verify token
                const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
                // Check if requester is admin
                const requester = await User.findById(decoded.id);
                if (!requester || requester.role !== 'admin') {
                    return sendError(res, 'Access denied. Only admins can create this role.', 403);
                }
            } catch (error) {
                return sendError(res, 'Invalid token authorization', 401);
            }
        }

        // Check if user exists (email or phone)
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingUser) {
            return sendError(res, 'User with this email or phone already exists', 400);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role: role || 'customer',
            isEmailVerified: false,
            isPhoneVerified: false
        });

        // Generate Token
        const token = generateToken((user._id as unknown) as string, user.role);

        sendSuccess(res, {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            token
        }, 'User registered successfully', 201);

    } catch (error: any) {
        sendError(res, 'Registration failed', 500, error.message);
    }
};

// @desc    Login user with Email/Password
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return sendError(res, 'Invalid credentials', 401);
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password || '');

        if (!isMatch) {
            return sendError(res, 'Invalid credentials', 401);
        }

        // Generate Token
        const token = generateToken((user._id as unknown) as string, user.role);

        sendSuccess(res, {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            token
        }, 'Login successful');

    } catch (error: any) {
        sendError(res, 'Login failed', 500, error.message);
    }
};

// @desc    Send OTP for Login/Verification (Email or Phone)
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOtp = async (req: Request, res: Response) => {
    try {
        const { phone, email } = req.body;

        let identifier = '';
        let type: 'phone' | 'email' = 'phone';

        if (phone) {
            const mobileRegex = /^[6-9]\d{9}$/;
            if (!mobileRegex.test(phone)) {
                return sendError(res, 'Invalid mobile number. Please enter a valid 10-digit Indian number.', 400);
            }
            identifier = phone;
            type = 'phone';
        } else if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return sendError(res, 'Invalid email address.', 400);
            }
            identifier = email;
            type = 'email';
        } else {
            return sendError(res, 'Please provide either phone or email.', 400);
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Expiration (e.g., 5 minutes from now)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Store in DB (Upsert)
        await Otp.findOneAndUpdate(
            { identifier, type },
            { otp, expiresAt },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // TODO: Integrate Email/SMS Provider
        console.log(`[OTP-SERVICE] OTP for ${type} ${identifier} is ${otp}`);

        sendSuccess(res, { message: 'OTP sent successfully', type }, `OTP sent to ${identifier}`);

    } catch (error: any) {
        sendError(res, 'Failed to send OTP', 500, error.message);
    }
};

// @desc    Verify OTP and Login (Auto-Register if new)
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { phone, email, otp } = req.body;

        let identifier = '';
        let type: 'phone' | 'email' = 'phone';

        if (phone) {
            identifier = phone;
            type = 'phone';
        } else if (email) {
            identifier = email;
            type = 'email';
        } else {
            return sendError(res, 'Phone or Email is required', 400);
        }

        if (!otp) {
            return sendError(res, 'OTP is required', 400);
        }

        // Verify OTP from DB
        const otpRecord = await Otp.findOne({ identifier, type, otp });

        if (!otpRecord) {
            return sendError(res, 'Invalid or Expired OTP', 400);
        }

        // Explicitly check for expiry (in case DB TTL hasn't run yet)
        if (otpRecord.expiresAt < new Date()) {
            await Otp.deleteOne({ _id: otpRecord._id }); // Cleanup
            return sendError(res, 'OTP has expired. Please request a new one.', 400);
        }

        // OTP Valid: Check if User exists
        // We check by phone OR email depending on what was used.
        const query = type === 'phone' ? { phone: identifier } : { email: identifier };
        let user = await User.findOne(query);

        if (!user) {
            // New User: Auto-Register
            const userData: any = {
                name: 'Guest User',
                role: 'customer',
            };

            if (type === 'phone') {
                userData.phone = identifier;
                userData.isPhoneVerified = true;
                userData.isEmailVerified = false;
            } else {
                userData.email = identifier;
                userData.isEmailVerified = true;
                userData.isPhoneVerified = false;
            }

            user = await User.create(userData) as any;
        } else {
            // Existing User: Update verification status
            if (type === 'phone' && !user.isPhoneVerified) {
                user.isPhoneVerified = true;
                await user.save();
            } else if (type === 'email' && !user.isEmailVerified) {
                user.isEmailVerified = true;
                await user.save();
            }
        }

        // Delete used OTP
        await Otp.deleteOne({ _id: otpRecord._id });

        if (!user) {
            return sendError(res, 'Authentication failed', 500);
        }

        const token = generateToken((user._id as unknown) as string, user.role);

        sendSuccess(res, {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            token
        }, 'OTP verified, login successful.');

    } catch (error: any) {
        sendError(res, 'OTP verification failed', 500, error.message);
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request | any, res: Response) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return sendError(res, 'User not found', 404);
        }
        sendSuccess(res, user, 'User profile fetched');
    } catch (error: any) {
        sendError(res, 'Failed to fetch profile', 500, error.message);
    }
}
