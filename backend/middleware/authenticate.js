import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authenticate = async (req, res, next) => {
  // Support both cookie and Authorization header
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token is not valid' });
    }
};

export default authenticate;
