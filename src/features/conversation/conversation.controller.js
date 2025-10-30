const ConversationService = require('./conversation.service');

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
        const message = await ConversationService.create(req.user._id, conversationId, recipientId, content, timestamp);

        return res.json({ success: true, message });
    } catch (e) {
        if (e.status) return res.status(e.status).json({ error: e.message });
        return res.status(500).json({ error: e.message });
    }
};

exports.getAllMessage = async (req, res, next) => {
    try {
        const conversationList = await ConversationService.listAll(req.user._id);

        res.json(conversationList);
    } catch (e) {
        if (e.status) return res.status(e.status).json({ error: e.message });
        return res.status(500).json({ error: e.message });
    }
}