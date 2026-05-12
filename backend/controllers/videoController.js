import Video from '../models/Video.js';

// POST /api/video  (create - auth required)
export const uploadVideo = async (req, res) => {
    try {
        const { title, description, videoLink, thumbnail, videoType } = req.body;

        if (!title || !videoLink || !thumbnail) {
            return res.status(400).json({ error: 'Title, videoLink, and thumbnail are required' });
        }

        const video = await Video.create({
            user: req.user._id,
            title,
            description: description || '',
            videoLink,
            thumbnail,
            videoType: videoType || 'Education',
        });

        await video.populate('user', 'channelName profilePic userName');

        return res.status(201).json({ success: true, video });
    } catch (error) {
        console.error('Upload video error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

// GET /api/videos  (all videos, supports ?search=&category=)
export const getAllVideos = async (req, res) => {
    try {
        const { search, category } = req.query;
        const filter = {};

        if (search) {
            filter.title = { $regex: search, $options: 'i' };
        }
        if (category && category !== 'All') {
            filter.videoType = category;
        }

        const videos = await Video.find(filter)
        .populate('user', 'channelName profilePic userName')
        .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, videos });
    } catch (error) {
        console.error('Get all videos error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

// GET /api/video/:id
export const getVideoById = async (req, res) => {
    try {
        const video = await Video.findByIdAndUpdate(
        req.params.id,
        { $inc: { views: 1 } },
        { returnDocument: 'after' }
        ).populate('user', 'channelName profilePic userName createdAt about');

        if (!video) return res.status(404).json({ error: 'Video not found' });

        return res.status(200).json({ success: true, video });
    } catch (error) {
        console.error('Get video by id error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

// GET /api/channel/:userId
export const getVideosByUser = async (req, res) => {
    try {
        const videos = await Video.find({ user: req.params.userId })
        .populate('user', 'channelName profilePic userName about createdAt')
        .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, videos });
    } catch (error) {
        console.error('Get videos by user error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

// PUT /api/video/:id  (update - auth required, must be owner)
export const updateVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ error: 'Video not found' });

        if (video.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to edit this video' });
        }

        const { title, description, videoLink, thumbnail, videoType } = req.body;

        const updated = await Video.findByIdAndUpdate(
        req.params.id,
        { title, description, videoLink, thumbnail, videoType },
        { returnDocument: 'after', runValidators: true }
        ).populate('user', 'channelName profilePic userName');

        return res.status(200).json({ success: true, video: updated });
    } catch (error) {
        console.error('Update video error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

// DELETE /api/video/:id  (auth required, must be owner)
export const deleteVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ error: 'Video not found' });

        if (video.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this video' });
        }

        await Video.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true, message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Delete video error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

// PUT /api/video/:id/like  (toggle like - auth required)
export const likeVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ error: 'Video not found' });

        const userId = req.user._id.toString();
        const alreadyLiked = video.likes.map(String).includes(userId);
        const alreadyDisliked = video.dislikes.map(String).includes(userId);

        if (alreadyLiked) {
            // Remove like (toggle off)
            video.likes = video.likes.filter((id) => id.toString() !== userId);
        } else {
            video.likes.push(req.user._id);
            // Remove from dislikes if present
            if (alreadyDisliked) {
                video.dislikes = video.dislikes.filter((id) => id.toString() !== userId);
            }
        }

        await video.save();
        return res.status(200).json({
            success: true,
            likes: video.likes.length,
            dislikes: video.dislikes.length,
            liked: !alreadyLiked,
            disliked: false,
        });
    } catch (error) {
        console.error('Like video error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

// PUT /api/video/:id/dislike  (toggle dislike - auth required)
export const dislikeVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ error: 'Video not found' });

        const userId = req.user._id.toString();
        const alreadyDisliked = video.dislikes.map(String).includes(userId);
        const alreadyLiked = video.likes.map(String).includes(userId);

        if (alreadyDisliked) {
            video.dislikes = video.dislikes.filter((id) => id.toString() !== userId);
        } else {
            video.dislikes.push(req.user._id);
            if (alreadyLiked) {
                video.likes = video.likes.filter((id) => id.toString() !== userId);
            }
        }

        await video.save();
        return res.status(200).json({
            success: true,
            likes: video.likes.length,
            dislikes: video.dislikes.length,
            liked: false,
            disliked: !alreadyDisliked,
        });
    } catch (error) {
        console.error('Dislike video error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
