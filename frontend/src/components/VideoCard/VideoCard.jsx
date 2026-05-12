import { Link } from 'react-router-dom';
import './VideoCard.css';

const formatViews = (views) => {
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
    return String(views);
};

const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} minutes ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hours ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} months ago`;
    return `${Math.floor(months / 12)} years ago`;
};

const VideoCard = ({ video }) => {
    const channel = video.user;
    return (
        <Link to={`/watch/${video._id}`} className="video-card">
            <div className="video-card-thumb">
                <img src={video.thumbnail} alt={video.title} className="video-card-thumb-img" loading="lazy"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/320x180/1a1a1a/666?text=No+Thumbnail';
                    }}
                />
            </div>
            <div className="video-card-info">
                <Link to={`/channel/${channel?._id}`} className="video-card-avatar-link" onClick={(e) => e.stopPropagation()}>
                    <img src={channel?.profilePic} alt={channel?.channelName} className="video-card-avatar"
                        onError={(e) => {
                            e.target.src = 'https://www.gravatar.com/avatar/?d=mp';
                        }}
                    />
                </Link>
                <div className="video-card-meta">
                    <h3 className="video-card-title">{video.title}</h3>
                    <Link to={`/channel/${channel?._id}`} className="video-card-channel" onClick={(e) => e.stopPropagation()}>
                        {channel?.channelName}
                    </Link>
                    <p className="video-card-stats">
                        {formatViews(video.views)} views &bull; {timeAgo(video.createdAt)}
                    </p>
                </div>
            </div>
        </Link>
    );
};

export default VideoCard;
