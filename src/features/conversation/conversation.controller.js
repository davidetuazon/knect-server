const ConversationService = require('./conversation.service');
const validate = require('validate.js');

exports.createMessage = async (req, res, next) => {
    const { conversationId, recipientId, content, timestamp } = req.body;
    const issues = validate(
        { recipientId, content, timestamp },
        { 
            conversationId: { presence: true },
            recipientId: { presence: true },
            content: { presence: true },
            timestamp: { presence: true },
        }
    );
    if (issues) return res.status(422).json({ error: issues });
    try {
        const message = await ConversationService.createMessage(req.user._id, conversationId, recipientId, content, timestamp);

        return res.json({ success: true, message });
    } catch (e) {
        if (e.status) return res.status(e.status).json({ error: e.message });
        return res.status(500).json({ error: e.message });
    }
};

exports.getAllConversations = async (req, res, next) => {
    try {
        const conversationList = await ConversationService.listConversations(req.user._id);

        res.json(conversationList);
    } catch (e) {
        if (e.status) return res.status(e.status).json({ error: e.message });
        return res.status(500).json({ error: e.message });
    }
}

exports.getConversation = async (req, res, next) => {
    const { id: conversationId } = req.params;
    const issues = validate({ conversationId }, { conversationId : { presence: true } });
    if (issues) return res.status(422).json({ error: issues });

    try {
        const conversation = await ConversationService.getConversation(req.user._id, conversationId);

        res.json({ conversation });
    } catch (e) {
        if (e.status) return res.status(e.status).json({ error: e.message });
        return res.status(500).json({ error: e.message });
    }
}

exports.geAllMessages = async (req, res, next) => {
    const { id: conversationId } = req.params;
    const issues = validate({ conversationId }, { conversationId : { presence: true } });
    if (issues) return res.status(422).json({ error: issues });

    try {
        const messages = await ConversationService.listMessages(req.user._id, conversationId);

        res.json(messages);
    } catch (e) {
        if (e.status) return res.status(e.status).json({ error: e.message });
        return res.status(500).json({ error: e.message });
    }
}