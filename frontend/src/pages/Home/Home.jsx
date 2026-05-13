import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import VideoCard from '../../components/VideoCard/VideoCard.jsx';
import './Home.css';

const CATEGORIES = [
  'All', 'Music', 'Gaming', 'News', 'Sports','Education', 'Science & Technology', 'Travel', 'Comedy', 'Live',
];

const Home = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');

    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search')   || '';
    const categoryParam = searchParams.get('category') || 'All';

    /* Sync active category chip with URL.When a search is active, reset category to "All", so that the search runs across all videos regardless of category. */
    useEffect(() => {
        if (searchQuery) {
            setActiveCategory('All');
        } else {
            setActiveCategory(categoryParam);
        }
    }, [searchQuery, categoryParam]);

    /* Fetch videos whenever search query OR active category changes */
    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            try {
                const params = {};
                if (searchQuery) params.search   = searchQuery;
                if (!searchQuery && activeCategory !== 'All') params.category = activeCategory;

                const res = await axios.get('/api/videos', { params });
                setVideos(res.data.videos || []);
            } catch (err) {
                console.error('Error fetching videos:', err);
                setVideos([]);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, [searchQuery, activeCategory]);

    /* Category chip click — clears search, sets category */
    const handleCategoryClick = (cat) => {
        setActiveCategory(cat);
        const params = new URLSearchParams();
        if (cat !== 'All') params.set('category', cat);
        navigate(params.toString() ? `/?${params.toString()}` : '/');
    };

    return (
        <div className="home">

            {/* Filter chips */}
            <div className="home-filters">
                {CATEGORIES.map((cat) => (
                    <button key={cat} className={`home-filter-chip ${(searchQuery ? cat === 'All' : cat === activeCategory) ? 'active' : ''}`} onClick={() => handleCategoryClick(cat)}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Active search banner */}
            {searchQuery && (
                <div className="home-search-banner">
                    <p> Results for <strong>"{searchQuery}"</strong>
                        {videos.length > 0 && (
                        <span className="home-search-count"> — {videos.length} video{videos.length !== 1 ? 's' : ''}</span>
                        )}
                    </p>
                    <button className="home-clear-search" onClick={() => navigate('/')}>
                        ✕ Clear search
                    </button>
                </div>
            )}

            {/* Video grid */}
            <div className="home-grid-wrapper">
                {loading ? (
                <div className="home-loading">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="home-skeleton">
                            <div className="skeleton-thumb" />
                            <div className="skeleton-info">
                            <div className="skeleton-line" />
                            <div className="skeleton-line short" />
                            </div>
                        </div>
                    ))}
                </div>
                ) : videos.length === 0 ? (
                <div className="home-empty">
                    <p> {searchQuery ? `No videos found for "${searchQuery}"` : `No videos in ${activeCategory}`} </p>
                    <button className="home-clear-search" onClick={() => navigate('/')}> Back to Home </button>
                </div>
                ) : (
                <div className="home-grid"> {videos.map((video) => (<VideoCard key={video._id} video={video} />))} </div>
                )}
            </div>
        </div>
    );
};

export default Home;
