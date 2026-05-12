import express from 'express';
import {
    addComment,
    getCommentsByVideo,
    updateComment,
    deleteComment,
} from '../controllers/commentController.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

router.get('/comments/:videoId', getCommentsByVideo);        // GET comments for a video
router.post('/comments', authenticate, addComment);          // POST add comment
router.put('/comments/:id', authenticate, updateComment);    // PUT edit comment
router.delete('/comments/:id', authenticate, deleteComment); // DELETE comment

export default router;
