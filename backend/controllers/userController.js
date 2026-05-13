import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/* Validation Helpers */
const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]+$/;          // alphanumeric + underscore only

const validateSignUp = ({ channelName, userName, email, password }) => {
    const errors = {};

    // Channel name
    if (!channelName || !channelName.trim())
        errors.channelName = 'Channel name is required';
    else if (channelName.trim().length < 2)
        errors.channelName = 'Channel name must be at least 2 characters';
    else if (channelName.trim().length > 60)
        errors.channelName = 'Channel name must be 60 characters or fewer';

    // Username
    if (!userName || !userName.trim())
        errors.userName = 'Username is required';
    else if (userName.trim().length < 3)
        errors.userName = 'Username must be at least 3 characters';
    else if (userName.trim().length > 30)
        errors.userName = 'Username must be 30 characters or fewer';
    else if (!USERNAME_RE.test(userName.trim()))
        errors.userName = 'Username may only contain letters, numbers, and underscores';

    // Email
    if (!email || !email.trim())
        errors.email = 'Email is required';
    else if (!EMAIL_RE.test(email.trim()))
        errors.email = 'Enter a valid email address';

    // Password
    if (!password)
        errors.password = 'Password is required';
    else if (password.length < 6)
        errors.password = 'Password must be at least 6 characters';
    else if (password.length > 128)
        errors.password = 'Password is too long';

    return errors;
};

/* POST /auth/signup */
export const signUp = async (req, res) => {
    try {
        const { channelName, userName, email, password, about, profilePic } = req.body;

        // Server-side validation
        const validationErrors = validateSignUp({ channelName, userName, email, password });
        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({ error: Object.values(validationErrors)[0], fields: validationErrors });
        }

        const sanitizedEmail    = email.trim().toLowerCase();
        const sanitizedUserName = userName.trim();
        const sanitizedChannel  = channelName.trim();

        // Duplicate check
        const existingUser = await User.findOne({
            $or: [{ userName: sanitizedUserName }, { email: sanitizedEmail }],
        });
        if (existingUser) {
            if (existingUser.userName === sanitizedUserName)
                return res.status(409).json({ error: 'Username already taken', fields: { userName: 'Username already taken' } });
            return res.status(409).json({ error: 'Email already registered', fields: { email: 'Email already registered' } });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
        channelName: sanitizedChannel,
        userName: sanitizedUserName,
        email: sanitizedEmail,
        password: hashedPassword,
        about: about?.trim() || '',
        profilePic: profilePic?.trim() || 'https://www.gravatar.com/avatar/?d=mp',
        });

        return res.status(201).json({
            success: true,
            message: 'Account created successfully! Please log in.',
            userId: user._id,
        });
    } catch (error) {
        console.error('SignUp error:', error);
        return res.status(500).json({ error: 'Server error during registration' });
    }
};

/* POST /auth/login */
export const signIn = async (req, res) => {
    try {
        const { userName, password } = req.body;

        if (!userName || !userName.trim())
        return res.status(400).json({ error: 'Username or email is required', fields: { userName: 'Username or email is required' } });
        if (!password)
        return res.status(400).json({ error: 'Password is required', fields: { password: 'Password is required' } });

        const sanitized = userName.trim().toLowerCase();

        // Allow login by email OR username (case-insensitive)
        const user = await User.findOne({
            $or: [
                { userName: { $regex: new RegExp(`^${userName.trim()}$`, 'i') } },
                { email: sanitized },
            ],
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid username/email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username/email or password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, cookieOptions);

        return res.status(200).json({
            success: true,
            token,
            user: {
                _id:         user._id,
                channelName: user.channelName,
                userName:    user.userName,
                email:       user.email,
                profilePic:  user.profilePic,
                about:       user.about,
            },
        });
    } catch (error) {
        console.error('SignIn error:', error);
        return res.status(500).json({ error: 'Server error during login' });
    }
};

/* POST /auth/logout */
export const logout = async (req, res) => {
    res.clearCookie('token', cookieOptions).json({ success: true, message: 'Logged out successfully' });
};

/* GET /auth/me */
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
};

/* GET /auth/user/:id */
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
};
