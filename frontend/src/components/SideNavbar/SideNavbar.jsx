import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import VideocamIcon from '@mui/icons-material/Videocam';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import SubscriptionsOutlinedIcon from '@mui/icons-material/SubscriptionsOutlined';
import HistoryIcon from '@mui/icons-material/History';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SchoolIcon from '@mui/icons-material/School';
import ScienceIcon from '@mui/icons-material/Science';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { useAuth } from '../../context/AuthContext.jsx';
import './SideNavbar.css';

// Single nav item — two layouts: full (open) and mini (collapsed) 
const NavItem = ({ icon, iconActive, label, to, open, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === '/' && to === '/'
        ? !location.search  
        : location.pathname + location.search === to;

    const activeIcon = iconActive || icon;

    if (!open) {
        /* Mini (collapsed) layout */
        return (
            <Link to={to} className={`sidenav-mini-item ${isActive ? 'active' : ''}`} title={label} onClick={onClick}>
                <span className="sidenav-mini-icon">{isActive ? activeIcon : icon}</span>
                <span className="sidenav-mini-label">{label}</span>
            </Link>
        );
    }

    /* Full (open) layout */
    return (
        <Link to={to} className={`sidenav-item ${isActive ? 'active' : ''}`} onClick={onClick}>
            <span className="sidenav-icon">{isActive ? activeIcon : icon}</span>
            <span className="sidenav-label">{label}</span>
        </Link>
    );
};

/* Section divider (only in open mode) */
const Divider = () => <div className="sidenav-divider" />;

/* Section heading (only in open mode) */
const SectionTitle = ({ children }) => (
    <p className="sidenav-section-title">{children}</p>
);

/* Main component */
const SideNavbar = ({ open, onClose }) => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    /* Close mobile drawer on route change */
    useEffect(() => {
        if (onClose) onClose();
    }, [location.pathname, location.search]);

    /* Lock body scroll when mobile drawer is open */
    useEffect(() => {
        const isMobile = window.innerWidth <= 768;
        document.body.style.overflow = isMobile && open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    const SIZE = 22; // MUI icon size used throughout

    return (
        <>
            {/* Backdrop overlay — mobile only, when open */}
            <div className={`sidenav-overlay ${open ? 'sidenav-overlay-visible' : ''}`} onClick={onClose} aria-hidden="true"/>

            <aside className={`sidenav ${open ? 'sidenav-open' : 'sidenav-collapsed'}`}>

                {/* MAIN */}
                <NavItem open={open} icon={<HomeOutlinedIcon sx={{ fontSize: SIZE }} />} iconActive={<HomeIcon sx={{ fontSize: SIZE }} />} label="Home" to="/" />

                <NavItem open={open} icon={<VideocamIcon sx={{ fontSize: SIZE }} />} label="Shorts" to="/" />

                <NavItem open={open} icon={<SubscriptionsOutlinedIcon sx={{ fontSize: SIZE }} />} iconActive={<SubscriptionsIcon sx={{ fontSize: SIZE }} />} label="Subscriptions" to="/" />

                {open && <Divider />}

                {/* YOU */}
                {open && user && <SectionTitle>You</SectionTitle>}

                {user && <>
                <NavItem open={open} icon={<HistoryIcon sx={{ fontSize: SIZE }} />} label="History" to="/" />
                <NavItem open={open} icon={<PlaylistPlayIcon sx={{ fontSize: SIZE }} />} label="Playlists" to="/" />
                <NavItem open={open} icon={<VideoLibraryIcon sx={{ fontSize: SIZE }} />} label="Your videos" to={`/channel/${user._id}`} />
                <NavItem open={open} icon={<WatchLaterOutlinedIcon sx={{ fontSize: SIZE }} />} iconActive={<WatchLaterIcon sx={{ fontSize: SIZE }} />} label="Watch later" to="/" />
                <NavItem open={open} icon={<ThumbUpOutlinedIcon sx={{ fontSize: SIZE }} />} iconActive={<ThumbUpIcon sx={{ fontSize: SIZE }} />} label="Liked videos" to="/" />
                </>}

                {open && <Divider />}

                {/* EXPLORE */}
                {open && <SectionTitle>Explore</SectionTitle>}

                <NavItem open={open} icon={<TrendingUpIcon sx={{ fontSize: SIZE }} />} label="Trending" to="/?category=All" />
                <NavItem open={open} icon={<MusicNoteIcon sx={{ fontSize: SIZE }} />} label="Music" to="/?category=Music" />
                <NavItem open={open} icon={<SportsEsportsIcon sx={{ fontSize: SIZE }} />} label="Gaming" to="/?category=Gaming" />
                <NavItem open={open} icon={<NewspaperIcon sx={{ fontSize: SIZE }} />} label="News" to="/?category=News" />
                <NavItem open={open} icon={<SportsSoccerIcon sx={{ fontSize: SIZE }} />} label="Sports" to="/?category=Sports" />
                <NavItem open={open} icon={<SchoolIcon sx={{ fontSize: SIZE }} />} label="Education" to="/?category=Education" />
                <NavItem open={open} icon={<ScienceIcon sx={{ fontSize: SIZE }} />} label="Science & Tech" to="/?category=Science+%26+Technology" />
                <NavItem open={open} icon={<TravelExploreIcon sx={{ fontSize: SIZE }} />} label="Travel" to="/?category=Travel" />
                <NavItem open={open} icon={<EmojiEmotionsIcon sx={{ fontSize: SIZE }} />} label="Comedy" to="/?category=Comedy" />
                <NavItem open={open} icon={<LiveTvIcon sx={{ fontSize: SIZE }} />} label="Live" to="/?category=Live" />

                {open && <Divider />}

            </aside>
        </>
    );
};

export default SideNavbar;
