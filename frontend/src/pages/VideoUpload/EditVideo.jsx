import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import YouTubeIcon from '@mui/icons-material/YouTube';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext.jsx';
import './VideoUpload.css';

const CATEGORIES = [
  'All', 'Music', 'Gaming', 'News', 'Sports',
  'Education', 'Science & Technology', 'Travel', 'Comedy', 'Live',
];

const validateField = (name, value) => {
    switch (name) {
        case 'title':
            if (!value.trim()) return 'Title is required';
            if (value.trim().length < 3) return 'Title must be at least 3 characters';
            if (value.trim().length > 150) return 'Title must be 150 characters or fewer';
            return '';
        case 'videoLink':
            if (!value.trim()) return 'Video URL is required';
            try { new URL(value.trim()); return ''; }
            catch { return 'Enter a valid URL (e.g. https://...)'; }
        case 'thumbnail':
            if (!value.trim()) return 'Thumbnail URL is required';
            try { new URL(value.trim()); return ''; }
            catch { return 'Enter a valid URL (e.g. https://...)'; }
        default: 
            return '';
    }
};

const EditVideo = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [fields, setFields] = useState({
        title: '', description: '', videoLink: '', thumbnail: '', videoType: 'Education',
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await axios.get(`/api/video/${id}`);
                const v = res.data.video;
                if (v.user._id !== user._id) {
                    toast.error('Not authorized to edit this video');
                    navigate('/');
                    return;
                }
                setFields({
                    title:       v.title,
                    description: v.description || '',
                    videoLink:   v.videoLink,
                    thumbnail:   v.thumbnail,
                    videoType:   v.videoType || 'Education',
                });
            } catch {
                toast.error('Video not found');
                navigate('/');
            } finally {
                setFetching(false);
            }
        };
        fetchVideo();
    }, [id, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFields((p) => ({ ...p, [name]: value }));
        if (touched[name]) {
            setErrors((p) => ({ ...p, [name]: validateField(name, value) }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched((p) => ({ ...p, [name]: true }));
        setErrors((p) => ({ ...p, [name]: validateField(name, value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const required  = ['title', 'videoLink', 'thumbnail'];
        const newErrors = {};
        required.forEach((k) => { newErrors[k] = validateField(k, fields[k]); });
        setErrors(newErrors);
        setTouched(Object.fromEntries(required.map((k) => [k, true])));
        if (Object.values(newErrors).some(Boolean)) return;

        setLoading(true);
        try {
            await axios.put(`/api/video/${id}`, fields, { withCredentials: true });
            toast.success('Video updated successfully!');
            navigate(`/channel/${user._id}`);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="upload-page">
                <div className="upload-card upload-card-loading">
                    <div className="upload-skeleton" />
                    <div className="upload-skeleton short" />
                    <div className="upload-skeleton" />
                </div>
            </div>
        );
    }

    return (
        <div className="upload-page">
            <div className="upload-card">
                <div className="upload-header">
                    <YouTubeIcon sx={{ fontSize: 48, color: '#ff0000' }} />
                    <h1>Edit Video</h1>
                </div>

                <form className="upload-form" onSubmit={handleSubmit} noValidate>

                    {/* Title */}
                    <div className="upload-field">
                        <label htmlFor="title">Title <span className="upload-required">*</span></label>
                        <input
                            id="title" name="title" type="text"
                            placeholder="Enter a descriptive title"
                            value={fields.title}
                            onChange={handleChange} onBlur={handleBlur}
                            className={touched.title && errors.title ? 'invalid' : touched.title && !errors.title ? 'valid' : ''}
                            maxLength={150}
                        />
                        {touched.title && errors.title && <span className="upload-error">{errors.title}</span>}
                        <span className="upload-char-count">{fields.title.length}/150</span>
                    </div>

                    {/* Description */}
                    <div className="upload-field">
                        <label htmlFor="description">Description <span className="upload-optional">(optional)</span></label>
                        <textarea
                            id="description" name="description"
                            placeholder="Describe your video..."
                            value={fields.description}
                            onChange={handleChange}
                            rows={4} maxLength={2000}
                        />
                        <span className="upload-char-count">{fields.description.length}/2000</span>
                    </div>

                    {/* Video URL */}
                    <div className="upload-field">
                        <label htmlFor="videoLink">Video URL <span className="upload-required">*</span></label>
                        <input
                            id="videoLink" name="videoLink" type="url"
                            placeholder="https://example.com/video.mp4"
                            value={fields.videoLink}
                            onChange={handleChange} onBlur={handleBlur}
                            className={touched.videoLink && errors.videoLink ? 'invalid' : touched.videoLink && !errors.videoLink ? 'valid' : ''}
                        />
                        {touched.videoLink && errors.videoLink && <span className="upload-error">{errors.videoLink}</span>}
                    </div>

                    {/* Thumbnail URL */}
                    <div className="upload-field">
                        <label htmlFor="thumbnail">Thumbnail URL <span className="upload-required">*</span></label>
                        <input
                            id="thumbnail" name="thumbnail" type="url"
                            placeholder="https://example.com/thumbnail.jpg"
                            value={fields.thumbnail}
                            onChange={handleChange} onBlur={handleBlur}
                            className={touched.thumbnail && errors.thumbnail ? 'invalid' : touched.thumbnail && !errors.thumbnail ? 'valid' : ''}
                        />
                        {touched.thumbnail && errors.thumbnail && <span className="upload-error">{errors.thumbnail}</span>}
                        {fields.thumbnail && !errors.thumbnail && (
                        <div className="upload-thumb-preview">
                            <img src={fields.thumbnail} alt="Thumbnail preview" onError={(e) => { e.target.style.display = 'none'; }}/>
                        </div>
                        )}
                    </div>

                    {/* Category */}
                    <div className="upload-field">
                        <label htmlFor="videoType">Category</label>
                        <select
                            id="videoType" name="videoType"
                            value={fields.videoType}
                            onChange={handleChange}
                            className="upload-select"
                        >
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                        </select>
                    </div>

                    <div className="upload-btns">
                        <button type="submit" className="upload-btn primary" disabled={loading}> {loading ? <span className="upload-spinner" /> : 'Save Changes'} </button>
                        <Link to={`/channel/${user?._id}`} className="upload-btn secondary">Cancel</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditVideo;
