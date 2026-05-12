import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import YouTubeIcon from '@mui/icons-material/YouTube';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext.jsx';
import '../SignUp/SignUp.css';

const Login = () => {
    const [fields, setFields] = useState({ userName: '', password: '' });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const validate = (name, value) => {
        if (name === 'userName' && !value.trim()) return 'Username or email is required';
        if (name === 'password' && !value) return 'Password is required';
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFields((p) => ({ ...p, [name]: value }));
        if (touched[name]) setErrors((p) => ({ ...p, [name]: validate(name, value) }));
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched((p) => ({ ...p, [name]: true }));
        setErrors((p) => ({ ...p, [name]: validate(name, value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {
            userName: validate('userName', fields.userName),
            password: validate('password', fields.password),
        };
        setErrors(newErrors);
        setTouched({ userName: true, password: true });
        if (Object.values(newErrors).some(Boolean)) return;

        setLoading(true);
        try {
            const res = await axios.post('/auth/login', fields, { withCredentials: true });
            login(res.data.user, res.data.token, rememberMe);
            toast.success(`Welcome back, ${res.data.user.channelName}!`);
            navigate(from, { replace: true });
        } catch (err) {
            const data = err.response?.data;
            if (data?.fields) {
                setErrors((p) => ({ ...p, ...data.fields }));
            } else {
                toast.error(data?.error || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <YouTubeIcon sx={{ fontSize: 48, color: '#ff0000' }} />
                    <h1>Sign In</h1>
                    <p className="auth-subtitle">Welcome back!</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>

                {/* Username / Email */}
                <div className="auth-field">
                    <label htmlFor="userName">Username or Email</label>
                    <div className="auth-input-wrapper">
                        <input
                            id="userName"
                            name="userName"
                            type="text"
                            placeholder="Enter your username or email"
                            value={fields.userName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={touched.userName && errors.userName ? 'invalid' : ''}
                            autoFocus
                            autoComplete="username"
                        />
                    </div>
                    {touched.userName && errors.userName && (
                        <span className="auth-error" role="alert">{errors.userName}</span>
                    )}
                </div>

                {/* Password with show/hide */}
                <div className="auth-field">
                    <label htmlFor="password">Password</label>
                    <div className="auth-input-wrapper">
                        <input
                            id="password"
                            name="password"
                            type={showPw ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={fields.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={touched.password && errors.password ? 'invalid' : ''}
                            autoComplete="current-password"
                        />
                        <button type="button" className="auth-pw-toggle" onClick={() => setShowPw((p) => !p)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                            {showPw ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon   sx={{ fontSize: 18 }} />}
                        </button>
                    </div>
                    {touched.password && errors.password && (
                        <span className="auth-error" role="alert">{errors.password}</span>
                    )}
                </div>

                {/* Remember Me */}
                <label className="auth-remember">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}/>
                    <span>Remember me</span>
                    <span className="auth-remember-hint">
                        {rememberMe ? '(stays signed in after closing browser)' : '(signed out when browser closes)'}
                    </span>
                </label>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? <span className="auth-spinner" /> : 'Sign In'}
                </button>
                </form>

                <p className="auth-switch">
                    Don't have an account?{' '}
                    <Link to="/signup" className="auth-link">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
