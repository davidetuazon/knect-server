require('dotenv').config({ quiet: true });
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validate = require('validate.js');
const constraints = require('./user.validation');
const UserService = require('./user.service');

exports.register = async (req, res, next) => {
    const params = {...req.body};
    const issues = validate(params, constraints.register);
    if (issues) return res.status(422).json({ error: issues });

    try {
        params.password = await bcrypt.hash(params.password, 16);
        await UserService.createUser(params);

        res.status(201).json({ success: true, message: 'Registration Successful' });
    } catch (e) {
        if (e.status) return res.status(e.status).json({ error: e.message });
        if (e.code === 11000 && e.keyPattern?.email) {
            return res.status(409).json({ error: `An account with this email already exists` });
        }
        res.status(500).json({ error: e.message });
    }
}

exports.login = async (req, res, next) => {
    const params = {...req.body};
    const issues = validate(params, constraints.signIn);
    if (issues) return res.status(422).json({ error: issues });

    try {
        const user = await UserService.signIn(params);

        const payload = {
            email: user.email,
            _id: user._id,
        }

        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });

        res.send({ accessToken });
    } catch (e) {
        if (e.status) return res.status(e.status).json({ error: e.message });
        return res.status(500).json({ error: e.message });
    }
}

exports.updateProfile = async (req, res, next) => {
    const params = {...req.body};
    const issues = validate(params, constraints.profileUpdate);
    if (issues) return res.status(422).json({ error: issues });

    try {
        const updatedUser = await UserService.updateProfile(req.user._id, params);

        res.status(200).json({ success: true, message: 'Profile updated', user: updatedUser });
    } catch (e) {
        if (e.status) return res.status(e.status).json({ error: e.message });
        return res.status(500).json({ error: e.message });
    }
}

exports.uploadPhoto = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const updatedUser = await UserService.uploadPhoto(req.user._id, req.file);

        res.status(200).json({ success: true, message: 'Profile photo updated', photo: updatedUser.profilePhoto });
    } catch (e) {
        if (e.status) return res.status(e.status).json({ error: e.message });
        return res.status(500).json({ error: e.message });
    }
}