import express from 'express';
import {
    uploadVideo,
    getAllVideos,
    getVideoById,
    getVideosByUser,
    updateVideo,
    deleteVideo,
    likeVideo,
    dislikeVideo,
} from '../controllers/videoController.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

router.get('/videos', getAllVideos);                            // GET all (+ search & filter)
router.get('/video/:id', getVideoById);                         // GET single video
router.get('/channel/:userId', getVideosByUser);                // GET videos by user/channel
router.post('/video', authenticate, uploadVideo);               // POST create video
router.put('/video/:id', authenticate, updateVideo);            // PUT update video
router.delete('/video/:id', authenticate, deleteVideo);         // DELETE video
router.put('/video/:id/like', authenticate, likeVideo);         // PUT toggle like
router.put('/video/:id/dislike', authenticate, dislikeVideo);   // PUT toggle dislike

export default router;
