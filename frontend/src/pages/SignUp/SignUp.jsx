import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import YouTubeIcon from '@mui/icons-material/YouTube';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';
import { toast } from 'react-toastify';
import './SignUp.css';

/* ── Validation rules ────────────────────────────────────────────────────── */
const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]+$/;

const validateField = (name, value, allFields = {}) => {
    switch (name) {
        case 'channelName':
            if (!value.trim()) return 'Channel name is required';
            if (value.trim().length < 2) return 'At least 2 characters';
            if (value.trim().length > 60) return 'Maximum 60 characters';
            return '';
        case 'userName':
            if (!value.trim()) return 'Username is required';
            if (value.trim().length < 3) return 'At least 3 characters';
            if (value.trim().length > 30) return 'Maximum 30 characters';
            if (!USERNAME_RE.test(value.trim())) return 'Letters, numbers, and underscores only';
            return '';
        case 'email':
            if (!value.trim()) return 'Email is required';
            if (!EMAIL_RE.test(value.trim())) return 'Enter a valid email address';
            return '';
        case 'password':
            if (!value) return 'Password is required';
            if (value.length < 6) return 'At least 6 characters';
            if (value.length > 128) return 'Password is too long';
            return '';
        case 'confirmPassword':
            if (!value) return 'Please confirm your password';
            if (value !== allFields.password) return 'Passwords do not match';
            return '';
        default:
            return '';
    }
};

/* ── Password strength ───────────────────────────────────────────────────── */
const getPasswordStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score, label: 'Weak', color: '#ff4444' };
    if (score <= 3) return { score, label: 'Fair', color: '#ffaa00' };
    if (score <= 4) return { score, label: 'Good', color: '#3ea6ff' };
    return { score, label: 'Strong', color: '#00c853' };
};

/* ─────────────────────────────────────────────────────────────────────────────
 * Field — defined OUTSIDE SignUp so React never remounts it on re-render.
 * If this were inside SignUp, every keystroke would recreate the component
 * type, causing the input to unmount/remount and lose focus after each letter.
 * ───────────────────────────────────────────────────────────────────────────*/
const Field = ({
    name, 
    label, 
    type = 'text', 
    placeholder,
    value, 
    onChange, 
    onBlur,
    touched, 
    error, 
    optional,
}) => (
    <div className="auth-field">
        <label htmlFor={name}>{label}{optional && <span className="auth-optional"> (optional)</span>}</label>
        <div className="auth-input-wrapper">
            <input
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                className={touched && error ? 'invalid' : touched && !error ? 'valid' : ''}
                autoComplete={type === 'password' ? 'new-password' : 'on'}
            />
            {touched && !optional && (
                error ? <ErrorIcon className="auth-field-icon error" sx={{ fontSize: 18 }} /> : <CheckCircleIcon className="auth-field-icon success" sx={{ fontSize: 18 }} />
            )}
        </div>
        {touched && error && (
            <span className="auth-error" role="alert">{error}</span>
        )}
    </div>
);

/* ── Main component ──────────────────────────────────────────────────────── */
const SignUp = () => {
    const [fields, setFields] = useState({
        channelName: '', 
        userName: '', 
        email: '',
        password: '', 
        confirmPassword: '', 
        about: '', 
        profilePic: '',
    });
    const [errors, setErrors]  = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw]  = useState(false);
    const [showCpw, setShowCpw] = useState(false);
    const navigate = useNavigate();

    const pwStrength = getPasswordStrength(fields.password);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFields((p) => ({ ...p, [name]: value }));
        if (touched[name]) {
            const msg = validateField(name, value, { ...fields, [name]: value });
            setErrors((p) => ({ ...p, [name]: msg }));
        }
        if (name === 'password' && touched.confirmPassword) {
            const cpwMsg = validateField('confirmPassword', fields.confirmPassword, { ...fields, password: value });
            setErrors((p) => ({ ...p, confirmPassword: cpwMsg }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched((p) => ({ ...p, [name]: true }));
        const msg = validateField(name, value, fields);
        setErrors((p) => ({ ...p, [name]: msg }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const required = ['channelName', 'userName', 'email', 'password', 'confirmPassword'];
        const newErrors = {};
        required.forEach((name) => {
            newErrors[name] = validateField(name, fields[name], fields);
        });
        setErrors(newErrors);
        setTouched(Object.fromEntries(required.map((k) => [k, true])));
        if (Object.values(newErrors).some(Boolean)) return;

        setLoading(true);
        try {
            await axios.post('/auth/signup', {
                channelName: fields.channelName,
                userName: fields.userName,
                email: fields.email,
                password: fields.password,
                about: fields.about,
                profilePic: fields.profilePic || undefined,
            });
            toast.success('Account created! Please log in.');
            navigate('/login');
        } catch (err) {
            const data = err.response?.data;
            if (data?.fields) {
                setErrors((p) => ({ ...p, ...data.fields }));
            } else {
                toast.error(data?.error || 'Registration failed');
            }
        } finally {
            setLoading(false);
        }
    };

    /* Shared props builder — keeps JSX below clean */
    const fieldProps = (name) => ({
        name,
        value: fields[name],
        onChange: handleChange,
        onBlur: handleBlur,
        touched: touched[name],
        error: errors[name],
    });

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <YouTubeIcon sx={{ fontSize: 48, color: '#ff0000' }} />
                    <h1>Create Account</h1>
                    <p className="auth-subtitle">Join YouTube Clone today</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>

                    <Field {...fieldProps('channelName')} label="Channel Name" placeholder="Your channel name" />
                    <Field {...fieldProps('userName')} label="Username" placeholder="letters, numbers, underscores" />
                    <Field {...fieldProps('email')} label="Email" type="email" placeholder="you@example.com" />

                    {/* Password with show/hide + strength meter */}
                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <div className="auth-input-wrapper">
                            <input
                                id="password"
                                name="password"
                                type={showPw ? 'text' : 'password'}
                                placeholder="At least 6 characters"
                                value={fields.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={touched.password && errors.password ? 'invalid' : touched.password && !errors.password ? 'valid' : ''}
                                autoComplete="new-password"
                            />
                            <button type="button" className="auth-pw-toggle" onClick={() => setShowPw((p) => !p)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                                {showPw ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon   sx={{ fontSize: 18 }} />}
                            </button>
                        </div>
                        {fields.password && (
                            <div className="auth-strength">
                                <div className="auth-strength-bar">
                                    {[1,2,3,4,5].map((i) => (
                                        <div key={i} className="auth-strength-segment" style={{ background: i <= pwStrength.score ? pwStrength.color : '#383838' }}/>
                                    ))}
                                </div>
                                <span className="auth-strength-label" style={{ color: pwStrength.color }}>{pwStrength.label}</span>
                            </div>
                        )}
                        {touched.password && errors.password && (
                            <span className="auth-error" role="alert">{errors.password}</span>
                        )}
                    </div>

                    {/* Confirm Password with show/hide */}
                    <div className="auth-field">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className="auth-input-wrapper">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showCpw ? 'text' : 'password'}
                                placeholder="Re-enter your password"
                                value={fields.confirmPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={touched.confirmPassword && errors.confirmPassword ? 'invalid' : touched.confirmPassword && !errors.confirmPassword ? 'valid' : ''}
                                autoComplete="new-password"
                            />
                            <button type="button" className="auth-pw-toggle" onClick={() => setShowCpw((p) => !p)} aria-label={showCpw ? 'Hide password' : 'Show password'}>
                                {showCpw ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon   sx={{ fontSize: 18 }} />}
                            </button>
                        </div>
                        {touched.confirmPassword && errors.confirmPassword && (
                            <span className="auth-error" role="alert">{errors.confirmPassword}</span>
                        )}
                    </div>

                    {/* About */}
                    <div className="auth-field">
                        <label htmlFor="about"> About <span className="auth-optional">(optional)</span></label>
                        <textarea
                            id="about"
                            name="about"
                            placeholder="Tell us about your channel..."
                            value={fields.about}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>

                    {/* Profile pic URL */}
                    <div className="auth-field">
                        <label htmlFor="profilePic"> Profile Picture URL <span className="auth-optional">(optional)</span> </label>
                        <input
                            id="profilePic"
                            name="profilePic"
                            type="url"
                            placeholder="https://example.com/avatar.png"
                            value={fields.profilePic}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? <span className="auth-spinner" /> : 'Create Account'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;