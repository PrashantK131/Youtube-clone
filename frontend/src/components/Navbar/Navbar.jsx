import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import YouTubeIcon from '@mui/icons-material/YouTube';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import NotificationsIcon from '@mui/icons-material/Notifications';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../../context/AuthContext.jsx';
import './Navbar.css';

const Navbar = ({ toggleSideNav }) => {
    const { user, logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);

    const navigate  = useNavigate();
    const location  = useLocation();
    const menuRef   = useRef(null);
    const searchRef = useRef(null);
    const mobileRef = useRef(null);

    /* Sync search input with URL ?search= param */
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('search') || '';
        setSearchQuery(q);
    }, [location.search]);

    /* Close dropdown on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* Auto-focus for mobile search input */
    useEffect(() => {
        if (mobileSearchOpen && mobileRef.current) mobileRef.current.focus();
    }, [mobileSearchOpen]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
        setMobileSearchOpen(false);
        if (searchRef.current) searchRef.current.blur();
    };

    /* Clear button */
    const clearSearch = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSearchQuery('');
        // Navigate to home without search param, preserving category if present
        const params = new URLSearchParams(location.search);
        params.delete('search');
        const qs = params.toString();
        navigate(qs ? `/?${qs}` : '/');
        // Re-focus the input so user can type a new query immediately
        setTimeout(() => {
            if (searchRef.current) searchRef.current.focus();
            if (mobileRef.current) mobileRef.current.focus();
        }, 10);
    };

    const handleLogout = async () => {
        await logout();
        setShowMenu(false);
        navigate('/');
    };

    return (
        <nav className="navbar">

            {/* Mobile search overlay */}
            {mobileSearchOpen && (
                <div className="navbar-mobile-search">
                    <button className="navbar-icon-btn" onClick={() => { setMobileSearchOpen(false); }} aria-label="Close search">
                        <ArrowBackIcon sx={{ color: '#fff', fontSize: 24 }} />
                    </button>

                    <form className="navbar-mobile-search-form" onSubmit={handleSearch}>
                        <div className="navbar-search-inner">
                            <input
                                ref={mobileRef}
                                type="text"
                                className="navbar-search-input"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search videos"
                            />
                            {/* ✕ Clear button for mobile input */}
                            {searchQuery && (
                                <button type="button" className="navbar-clear-btn" onClick={clearSearch} aria-label="Clear search">
                                    <CloseIcon sx={{ fontSize: 20 }} />
                                </button>
                            )}
                        </div>
                        <button type="submit" className="navbar-search-btn" aria-label="Search">
                            <SearchIcon sx={{ color: '#fff', fontSize: 22 }} />
                        </button>
                    </form>

                    <button type="button" className="navbar-mic-btn" aria-label="Voice search">
                        <KeyboardVoiceIcon sx={{ color: '#fff', fontSize: 22 }} />
                    </button>
                </div>
            )}

            <div className="navbar-left">
                <button className="navbar-icon-btn" onClick={toggleSideNav} aria-label="Toggle sidebar">
                    <MenuIcon sx={{ color: '#fff', fontSize: 24 }} />
                </button>
                <Link to="/" className="navbar-logo">
                    <YouTubeIcon sx={{ fontSize: 32, color: '#ff0000' }} />
                    <span className="navbar-logo-text">YouTube</span>
                </Link>
            </div>

            {/* Middle — desktop search */}
            <form className="navbar-middle" onSubmit={handleSearch}>
                <div className={`navbar-search-wrapper ${searchFocused ? 'focused' : ''}`}>

                    {/* Input + ✕ clear button */}
                    <div className="navbar-search-inner">
                        <input
                            ref={searchRef}
                            type="text"
                            className="navbar-search-input"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            aria-label="Search videos"
                        />
                        {/* Only show ✕ when there is text in the box */}
                        {searchQuery && (
                        <button
                            type="button"
                            className="navbar-clear-btn"
                            onClick={clearSearch}
                            onMouseDown={(e) => e.preventDefault()} 
                            aria-label="Clear search"
                            tabIndex={0}
                        >
                            <CloseIcon sx={{ fontSize: 20 }} />
                        </button>
                        )}
                    </div>

                    {/* Magnifier submit button */}
                    <button type="submit" className="navbar-search-btn" aria-label="Search">
                        <SearchIcon sx={{ color: '#aaa', fontSize: 22 }} />
                    </button>
                </div>

                <button type="button" className="navbar-mic-btn" aria-label="Voice search">
                    <KeyboardVoiceIcon sx={{ color: '#fff', fontSize: 22 }} />
                </button>
            </form>

            <div className="navbar-right">
                {/* Mobile search icon — shown only on small screens */}
                <button className="navbar-icon-btn navbar-mobile-search-btn" onClick={() => setMobileSearchOpen(true)} aria-label="Search">
                    <SearchIcon sx={{ color: '#fff', fontSize: 24 }} />
                </button>

                {user ? (
                <>
                    <Link to="/upload" className="navbar-icon-btn" title="Upload video">
                        <VideoCallIcon sx={{ fontSize: 26, color: '#fff' }} />
                    </Link>
                    <button className="navbar-icon-btn navbar-hide-xs" aria-label="Notifications">
                        <NotificationsIcon sx={{ fontSize: 24, color: '#fff' }} />
                    </button>
                    <div className="navbar-avatar-wrapper" ref={menuRef}>
                    <img
                        src={user.profilePic}
                        alt={user.channelName}
                        className="navbar-avatar"
                        onClick={() => setShowMenu((p) => !p)}
                        onError={(e) => (e.target.src = 'https://www.gravatar.com/avatar/?d=mp')}
                    />
                    {showMenu && (
                        <div className="navbar-dropdown" role="menu">
                            <div className="navbar-dropdown-header">
                                <img
                                    src={user.profilePic}
                                    alt={user.channelName}
                                    className="navbar-dropdown-avatar"
                                    onError={(e) => (e.target.src = 'https://www.gravatar.com/avatar/?d=mp')}
                                />
                                <div>
                                    <p className="navbar-dropdown-name">{user.channelName}</p>
                                    <p className="navbar-dropdown-handle">@{user.userName}</p>
                                </div>
                            </div>
                            <div className="navbar-dropdown-divider" />
                            <div className="navbar-dropdown-item" role="menuitem" onClick={() => { navigate(`/channel/${user._id}`); setShowMenu(false); }}>
                                Your Channel
                            </div>
                            <div className="navbar-dropdown-item" role="menuitem" onClick={() => { navigate('/upload'); setShowMenu(false); }}>
                                Upload Video
                            </div>
                            <div className="navbar-dropdown-divider" />
                            <div className="navbar-dropdown-item danger" role="menuitem" onClick={handleLogout}>
                                Sign Out
                            </div>
                        </div>
                    )}
                    </div>
                </>
                ) : (
                <Link to="/login" className="navbar-signin-btn">
                    <AccountCircleIcon sx={{ fontSize: 20 }} />
                    <span className="navbar-signin-text">Sign In</span>
                </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
