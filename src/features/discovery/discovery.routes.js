const express = require('express');
const router = express.Router();

const discoveryController = require('./discovery.controller');
const utils = require('../../shared/helpers/utils');

router.get('/discover', utils.authenticate, discoveryController.getDiscoveryFeed);

router.get('/discover/profile/:id', utils.authenticate, discoveryController.userGet);

router.post('/discover/like', utils.authenticate, discoveryController.userLike);

router.post('/discover/skip', utils.authenticate, discoveryController.userSkip);

module.exports = router;