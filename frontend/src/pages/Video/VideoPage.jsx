import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import ThumbDownIcon from '@mui/icons-material/ThumbDownAlt';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import { useAuth } from '../../context/AuthContext.jsx';
import './VideoPage.css';

const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
};

const formatViews = (views) => {
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
    return String(views);
};

// Recommended Video Card 
const RecommendedCard = ({ video }) => (
    <Link to={`/watch/${video._id}`} className="rec-card">
        <div className="rec-thumb-wrapper">
            <img
                src={video.thumbnail}
                alt={video.title}
                className="rec-thumb"
                onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/168x94/1a1a1a/666?text=No+Thumbnail';
                }}
            />
        </div>
        <div className="rec-info">
            <p className="rec-title">{video.title}</p>
            <p className="rec-channel">{video.user?.channelName}</p>
            <p className="rec-meta"> {formatViews(video.views)} views &bull; {timeAgo(video.createdAt)} </p>
        </div>
    </Link>
);

// Main Component 
const VideoPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [video, setVideo] = useState(null);
    const [recommended, setRecommended] = useState([]);
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState('');
    const [editingComment, setEditingComment] = useState(null);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [dislikesCount, setDislikesCount] = useState(0);
    const [loadingVideo, setLoadingVideo] = useState(true);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [showFullDesc, setShowFullDesc] = useState(false);

    // Fetch current video
    useEffect(() => {
        const fetchVideo = async () => {
            setLoadingVideo(true);
            setShowFullDesc(false);
            try {
                const res = await axios.get(`/api/video/${id}`);
                const v = res.data.video;
                setVideo(v);
                setLikesCount(v.likes.length);
                setDislikesCount(v.dislikes.length);
                if (user) {
                    setLiked(v.likes.map(String).includes(user._id));
                    setDisliked(v.dislikes.map(String).includes(user._id));
                }
            } catch {
                toast.error('Video not found');
                navigate('/');
            } finally {
                setLoadingVideo(false);
            }
        };
        fetchVideo();
    }, [id]);

    // Fetch recommended videos (same category, exclude current)
    useEffect(() => {
        if (!video) return;
        const fetchRecommended = async () => {
        try {
            const params = {};
            if (video.videoType && video.videoType !== 'All') {
                params.category = video.videoType;
            }
            const res = await axios.get('/api/videos', { params });
            const others = res.data.videos.filter((v) => v._id !== id);
            setRecommended(others.slice(0, 15));
        } catch {
            // non-critical — silently fail
        }
        };
        fetchRecommended();
    }, [video, id]);

    // Fetch comments
    useEffect(() => {
        const fetchComments = async () => {
        try {
            const res = await axios.get(`/api/comments/${id}`);
            setComments(res.data.comments);
        } catch {
            console.error('Failed to load comments');
        }
        };
        fetchComments();
    }, [id]);

    const handleLike = async () => {
        if (!user) { toast.error('Please sign in to like videos'); return; }
        try {
            const res = await axios.put(`/api/video/${id}/like`, {}, { withCredentials: true });
            setLiked(res.data.liked);
            setDisliked(res.data.disliked);
            setLikesCount(res.data.likes);
            setDislikesCount(res.data.dislikes);
        } catch {
            toast.error('Failed to update like');
        }
    };

    const handleDislike = async () => {
        if (!user) { toast.error('Please sign in to dislike videos'); return; }
        try {
            const res = await axios.put(`/api/video/${id}/dislike`, {}, { withCredentials: true });
            setLiked(res.data.liked);
            setDisliked(res.data.disliked);
            setLikesCount(res.data.likes);
            setDislikesCount(res.data.dislikes);
        } catch {
            toast.error('Failed to update dislike');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!user) { toast.error('Please sign in to comment'); return; }
        if (!commentInput.trim()) return;
        setSubmittingComment(true);
        try {
            const res = await axios.post(
                '/api/comments',
                { message: commentInput.trim(), video: id },
                { withCredentials: true }
            );
            setComments([res.data.comment, ...comments]);
            setCommentInput('');
        } catch {
            toast.error('Failed to post comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editingComment?.text.trim()) return;
        try {
            const res = await axios.put(
                `/api/comments/${commentId}`,
                { message: editingComment.text },
                { withCredentials: true }
            );
            setComments(comments.map((c) => (c._id === commentId ? res.data.comment : c)));
            setEditingComment(null);
            toast.success('Comment updated');
        } catch {
            toast.error('Failed to update comment');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await axios.delete(`/api/comments/${commentId}`, { withCredentials: true });
            setComments(comments.filter((c) => c._id !== commentId));
            toast.success('Comment deleted');
        } catch {
            toast.error('Failed to delete comment');
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
    };

    // Loading skeleton
    if (loadingVideo) {
        return (
            <div className="vp-layout">
                <div className="vp-left">
                    <div className="vp-skeleton-player" />
                    <div className="vp-skeleton-line" />
                    <div className="vp-skeleton-line short" />
                </div>
                <div className="vp-right">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="vp-skeleton-rec" />
                    ))}
                </div>
            </div>
        );
    }

    if (!video) return null;

    const descPreview = video.description?.slice(0, 200);
    const hasMoreDesc = video.description?.length > 200;

    return (
        <div className="vp-layout">
            {/* LEFT COLUMN — player + info + comments */}
            <div className="vp-left">

                {/* Player */}
                <div className="vp-player-wrapper">
                    <video key={video.videoLink} controls autoPlay className="vp-player">
                        <source src={video.videoLink} />
                        Your browser does not support the video tag.
                    </video>
                </div>

                {/* Title */}
                <h1 className="vp-title">{video.title}</h1>

                {/* Channel row + like/dislike/share */}
                <div className="vp-meta-row">
                    <div className="vp-channel-info">
                        <Link to={`/channel/${video.user?._id}`} className="vp-channel-avatar-link">
                            <img
                                src={video.user?.profilePic}
                                alt={video.user?.channelName}
                                className="vp-channel-avatar"
                                onError={(e) => (e.target.src = 'https://www.gravatar.com/avatar/?d=mp')}
                            />
                        </Link>
                        <div>
                            <Link to={`/channel/${video.user?._id}`} className="vp-channel-name"> {video.user?.channelName} </Link>
                            <p className="vp-channel-joined"> Joined {video.user?.createdAt?.slice(0, 10)} </p>
                        </div>
                        <button className="vp-subscribe-btn">Subscribe</button>
                    </div>

                    <div className="vp-action-bar">
                        {/* Like / Dislike pill */}
                        <div className="vp-like-pill">
                            <button className={`vp-like-btn ${liked ? 'active' : ''}`} onClick={handleLike} title="Like">
                                {liked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                                <span>{likesCount}</span>
                            </button>
                            <div className="vp-pill-divider" />
                            <button className={`vp-like-btn ${disliked ? 'active' : ''}`} onClick={handleDislike} title="Dislike">
                                {disliked ? <ThumbDownIcon /> : <ThumbDownOutlinedIcon />}
                                <span>{dislikesCount}</span>
                            </button>
                        </div>

                        {/* Share */}
                        <button className="vp-share-btn" onClick={handleShare}><ShareIcon sx={{ fontSize: 18 }} /> Share </button>
                    </div>
                </div>

                {/* Description box */}
                <div className="vp-description">
                    <div className="vp-desc-stats">
                        <span>{formatViews(video.views)} views</span>
                        <span>{timeAgo(video.createdAt)}</span>
                        <span className="vp-category-tag">{video.videoType}</span>
                    </div>
                    <p className="vp-desc-text">
                        {showFullDesc || !hasMoreDesc ? video.description : descPreview + '...'}
                    </p>
                    {hasMoreDesc && (
                        <button className="vp-desc-toggle" onClick={() => setShowFullDesc((p) => !p)}>
                            {showFullDesc ? 'Show less' : 'Show more'}
                        </button>
                    )}
                </div>

                {/* ── Comments ── */}
                <div className="vp-comments">
                    <h2 className="vp-comments-title">{comments.length} Comments</h2>

                    {/* Add comment */}
                    <form className="vp-add-comment" onSubmit={handleAddComment}>
                        <img
                            src={user?.profilePic || 'https://www.gravatar.com/avatar/?d=mp'}
                            alt="You"
                            className="vp-comment-avatar"
                            onError={(e) => (e.target.src = 'https://www.gravatar.com/avatar/?d=mp')}
                        />
                        <div className="vp-comment-input-wrapper">
                            <input
                                type="text"
                                placeholder={user ? 'Add a comment...' : 'Sign in to comment'}
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                className="vp-comment-input"
                                disabled={!user}
                            />
                            {commentInput.trim() && (
                                <div className="vp-comment-actions">
                                <button type="button" className="vp-comment-cancel" onClick={() => setCommentInput('')}>
                                    Cancel
                                </button>
                                <button type="submit" className="vp-comment-submit" disabled={submittingComment}>
                                    {submittingComment ? 'Posting...' : 'Comment'}
                                </button>
                                </div>
                            )}
                        </div>
                    </form>

                    {/* Comment list */}
                    <div className="vp-comment-list">
                        {comments.map((comment) => (
                        <div key={comment._id} className="vp-comment-item">
                            <img
                                src={comment.user?.profilePic}
                                alt={comment.user?.channelName}
                                className="vp-comment-avatar"
                                onError={(e) => (e.target.src = 'https://www.gravatar.com/avatar/?d=mp')}
                            />
                            <div className="vp-comment-body">
                                <div className="vp-comment-header">
                                    <span className="vp-comment-author">@{comment.user?.userName}</span>
                                    <span className="vp-comment-time">{timeAgo(comment.createdAt)}</span>
                                </div>

                                {editingComment?.id === comment._id ? (
                                    <div className="vp-comment-edit">
                                        <input
                                            value={editingComment.text}
                                            onChange={(e) =>
                                                setEditingComment({ ...editingComment, text: e.target.value })
                                            }
                                            className="vp-comment-input"
                                            autoFocus
                                        />
                                        <div className="vp-comment-actions">
                                            <button className="vp-comment-cancel" onClick={() => setEditingComment(null)}>
                                                Cancel
                                            </button>
                                            <button className="vp-comment-submit" onClick={() => handleEditComment(comment._id)}>
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="vp-comment-text">{comment.message}</p>
                                )}

                                {user && user._id === comment.user?._id && editingComment?.id !== comment._id && (
                                    <div className="vp-comment-controls">
                                        <button
                                            className="vp-comment-ctrl-btn"
                                            onClick={() =>
                                                setEditingComment({ id: comment._id, text: comment.message })
                                            }
                                            title="Edit"
                                        >
                                            <EditIcon sx={{ fontSize: 16 }} /> Edit
                                        </button>
                                        <button
                                            className="vp-comment-ctrl-btn danger"
                                            onClick={() => handleDeleteComment(comment._id)}
                                            title="Delete"
                                        >
                                            <DeleteIcon sx={{ fontSize: 16 }} /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN — recommended videos */}
            <div className="vp-right">
                <h3 className="vp-rec-title">Up Next</h3>
                <div className="vp-rec-list">
                    {recommended.length === 0 ? (
                        <p className="vp-rec-empty">No recommendations available.</p>
                    ) : (
                        recommended.map((v) => <RecommendedCard key={v._id} video={v} />)
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoPage;
