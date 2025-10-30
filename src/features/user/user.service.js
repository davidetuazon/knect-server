const UserModel = require('./user.model');
const bcrypt = require('bcryptjs');
const { toSafeUser } = require('./user.utils');
const { allowedUpdates } = require('../../shared/helpers/service.utils');
const cloudinary = require('../../config/cloudinary');

exports.createUser = async (params) => {
    if (!params) throw { status: 400, message: 'Missing request body' };

    try {
        await UserModel.create(params);
    } catch (e) {
        throw(e);
    }
}

exports.signIn = async (params) => {
    if (!params) throw { status: 400, message: 'Missing request body' };

    try {
        const user = await UserModel.findOne({
            deleted: false,
            email: params.email,
        })

        if (!user) throw { status: 404, message: 'User not found' };

        const matched = await bcrypt.compare(params.password, user.password);
        if (!matched) throw { status: 401, message: 'Incorrect email / password' };

        return {
            email: user.email,
            _id: user._id,
        };
    } catch (e) {
        throw(e);
    }
}

exports.updateProfile = async (userId, updates) => {
    const safeUpdates = allowedUpdates(['fullName', 'age', 'bio'], updates);

    try {
        const user = await UserModel.findByIdAndUpdate(userId, safeUpdates, { new: true });
        if (!user) throw { status: 404, message: 'User not found' };

        const safeUser = toSafeUser(user);
        return safeUser;
    } catch (e) {
        throw(e);
    }
}

exports.uploadPhoto = async (userId, file) => {
    try {
        const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        const result = await cloudinary.uploader.upload(base64, { folder: 'knect/profiles' });

        const user = await UserModel.findByIdAndUpdate(userId, { profilePhoto: result.secure_url }, { new: true });
        if (!user) throw { status: 404, message: 'User not found' };

        const safeUser = toSafeUser(user);
        return safeUser;
    } catch (e) {
        throw(e);
    }
}