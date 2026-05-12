import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../context/AuthContext.jsx';
import './Channel.css';

const Channel = () => {
    const { userId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [channelUser, setChannelUser] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const isOwner = user && user._id === userId;

    useEffect(() => {
        const fetchChannel = async () => {
            setLoading(true);
            try {
                const [userRes, videosRes] = await Promise.all([
                    axios.get(`/auth/user/${userId}`),
                    axios.get(`/api/channel/${userId}`),
                ]);
                setChannelUser(userRes.data.user);
                setVideos(videosRes.data.videos);
            } catch (err) {
                toast.error('Channel not found');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchChannel();
    }, [userId]);

    const handleDelete = async (videoId) => {
        if (!window.confirm('Delete this video permanently?')) return;
        try {
            await axios.delete(`/api/video/${videoId}`, { withCredentials: true });
            setVideos((prev) => prev.filter((v) => v._id !== videoId));
            toast.success('Video deleted');
        } catch {
            toast.error('Failed to delete video');
        }
    };

    if (loading) {
        return (
            <div className="channel-loading">
                <div className="channel-skeleton-banner" />
                <div className="channel-skeleton-info" />
            </div>
        );
    }

    if (!channelUser) return null;

    return (
        <div className="channel">
            {/* Banner */}
            <div className="channel-banner">
                <div className="channel-banner-gradient" />
            </div>

            {/* Channel header */}
            <div className="channel-header">
                <img
                    src={channelUser.profilePic}
                    alt={channelUser.channelName}
                    className="channel-avatar"
                    onError={(e) => (e.target.src = 'https://www.gravatar.com/avatar/?d=mp')}
                />
                <div className="channel-info">
                    <h1 className="channel-name">{channelUser.channelName}</h1>
                    <p className="channel-handle">@{channelUser.userName}</p>
                    <p className="channel-stats">
                        {videos.length} video{videos.length !== 1 ? 's' : ''} &bull; Joined{' '}
                        {channelUser.createdAt?.slice(0, 10)}
                    </p>
                    {channelUser.about && <p className="channel-about">{channelUser.about}</p>}
                </div>
                {!isOwner && (
                    <button className="channel-subscribe-btn">Subscribe</button>
                )}
                {isOwner && (
                <Link to="/upload" className="channel-upload-btn">
                    <AddIcon /> Upload Video
                </Link>
                )}
            </div>

            {/* Videos tab */}
            <div className="channel-tabs">
                <button className="channel-tab active">Videos</button>
            </div>

            {videos.length === 0 ? (
                <div className="channel-empty">
                    <p>No videos yet.</p>
                    {isOwner && (
                        <Link to="/upload" className="channel-upload-btn">
                            <AddIcon /> Upload your first video
                        </Link>
                    )}
                </div>
            ) : (
                <div className="channel-grid">
                    {videos.map((video) => (
                        <div key={video._id} className="channel-video-card">
                            <Link to={`/watch/${video._id}`} className="channel-video-thumb-link">
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="channel-video-thumb"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/320x180/1a1a1a/666?text=No+Thumbnail';
                                    }}
                                />
                            </Link>
                            <div className="channel-video-info">
                                <Link to={`/watch/${video._id}`} className="channel-video-title">
                                    {video.title}
                                </Link>
                                <p className="channel-video-meta">
                                    {video.views} views &bull;{' '}
                                    {new Date(video.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            {isOwner && (
                                <div className="channel-video-controls">
                                    <button className="channel-ctrl-btn" onClick={() => navigate(`/edit/${video._id}`)} title="Edit video">
                                        <EditIcon sx={{ fontSize: 18 }} />
                                    </button>
                                    <button className="channel-ctrl-btn danger" onClick={() => handleDelete(video._id)} title="Delete video">
                                        <DeleteIcon sx={{ fontSize: 18 }} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Channel;
