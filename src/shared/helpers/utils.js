require('dotenv').config({ quiet: true });
const jwt = require('jsonwebtoken');
const UserModel = require('../../features/user/user.model');
const CONSTANTS = require('./constants');
const multer = require('multer');

/**
 * attaches user to requests
 * used for authentication
 */
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

/**
 * token verification
 * mainly used by socket.io
 */
const verifyToken = async (token) => {
    if (!token) throw new Error('Unauthorized')

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await UserModel.findOne({ deleted: false, _id: decoded._id}).select(CONSTANTS.USER_FIELD);
        if (!user) throw new Error('User not found');

        return user;
    } catch (e) {
        throw new Error('Invalid or expired token');
    }
}

/** 
 * ensure request only accept image uploads
*/
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