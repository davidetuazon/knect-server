const express = require('express');
const router = express.Router();

const utils = require('../../shared/helpers/utils');
const conversationController = require('./conversation.controller');

router.get('/messages', utils.authenticate, conversationController.getAllConversations);

router.post('/messages/:conversationId', utils.authenticate, conversationController.createMessage);

module.exports = router;