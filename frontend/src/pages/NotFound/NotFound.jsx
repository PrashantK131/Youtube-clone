import { Link } from 'react-router-dom';
import YouTubeIcon from '@mui/icons-material/YouTube';
import './NotFound.css';

const NotFound = () => (
    <div className="notfound">
        <YouTubeIcon sx={{ fontSize: 64, color: '#ff0000', mb: 2 }} />
        <h1 className="notfound-code">404</h1>
        <h2 className="notfound-title">Page not found</h2>
        <p className="notfound-desc">
            The page you're looking for isn't available. Try searching or go back to the home page.
        </p>
        <Link to="/" className="notfound-btn">Go to Home</Link>
    </div>
);

export default NotFound;
