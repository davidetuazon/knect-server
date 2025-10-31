require('dotenv').config({ quiet: true });
const jwt = require('jsonwebtoken');
const UserModel = require('../../features/user/user.model');
const CONSTANTS = require('./constants');
const multer = require('multer');

const authenticate = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);
    try {
        const userLogged = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = await UserModel.findOne({ deleted: false, _id: userLogged._id }).select(CONSTANTS.USER_FIELD);

        if (!req.user) return res.status(404).json({ error: 'User not found' });
        next();
    } catch (e) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}

const verifyToken = async (token) => {
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await UserModel.findOne({ deleted: false, _id: decoded._id}).select(CONSTANTS.USER_FIELD);
        if (!user) return res.status(404).json({ error: 'User not found' });

        return user;
    } catch (e) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image uploads are allowed'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = {
    authenticate,
    verifyToken,
    upload,
}