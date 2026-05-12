import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        channelName: {
            type: String,
            required: [true, 'Channel name is required'],
            trim: true,
        },
        userName: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
        },
        about: {
            type: String,
            default: '',
        },
        profilePic: {
            type: String,
            default: 'https://www.gravatar.com/avatar/?d=mp',
        },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
