import Comment from '../models/Comment.js';

// POST /api/comments  (auth required)
export const addComment = async (req, res) => {
    try {
        const { message, video } = req.body;

        if (!message || !video) {
            return res.status(400).json({ error: 'message and video are required' });
        }

        const comment = await Comment.create({
            user: req.user._id,
            video,
            message,
        });

        await comment.populate('user', 'channelName profilePic userName');

        return res.status(201).json({ success: true, comment });
    } catch (error) {
        console.error('Add comment error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

// GET /api/comments/:videoId
export const getCommentsByVideo = async (req, res) => {
    try {
        const comments = await Comment.find({ video: req.params.videoId })
        .populate('user', 'channelName profilePic userName')
        .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, comments });
    } catch (error) {
        console.error('Get comments error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

// PUT /api/comments/:id  (auth required, must be owner)
export const updateComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to edit this comment' });
        }

        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        comment.message = message;
        await comment.save();
        await comment.populate('user', 'channelName profilePic userName');

        return res.status(200).json({ success: true, comment });
    } catch (error) {
        console.error('Update comment error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

// DELETE /api/comments/:id  (auth required, must be owner)
export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }

        await Comment.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true, message: 'Comment deleted' });
    } catch (error) {
        console.error('Delete comment error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
