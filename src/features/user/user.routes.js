const express = require('express');
const router = express.Router();

const userController = require('./user.controller');
const utils = require('../../shared/helpers/utils');

router.post('/user/register', userController.register);

router.post('/user/login', userController.login);

router.patch('/settings/profile', utils.authenticate, userController.updateProfile);

router.patch('/settings/profile-photo', utils.authenticate, utils.upload.single('profilePhoto'), userController.uploadPhoto);

router.get('/me', utils.authenticate, async (req, res, next) => {
    try {
        res.send(req.user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    };
});

module.exports = router;