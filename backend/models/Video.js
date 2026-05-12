import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        videoLink: {
            type: String,
            required: [true, 'Video URL is required'],
        },
        thumbnail: {
            type: String,
            required: [true, 'Thumbnail is required'],
        },
        videoType: {
            type: String,
            default: 'All',
            enum: [
                'All',
                'Music',
                'Gaming',
                'News',
                'Sports',
                'Education',
                'Science & Technology',
                'Travel',
                'Comedy',
                'Live',
            ],
        },
        likes: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'User',
            default: [],
        },
        dislikes: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'User',
            default: [],
        },
        views: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const Video = mongoose.model('Video', videoSchema);

export default Video;
