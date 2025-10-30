const DiscoveryService = require('./discovery.service');
const validate = require('validate.js');

exports.getDiscoveryFeed = async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 20;

    try {
        const users = await DiscoveryService.discoverUser(req.user._id, { limit });
        res.status(200).json({ success: true, users });
    } catch (e) {
        if (e.status) return res.status(e.status).json({ error: e.message });
        return res.status(500).json({ error: e.message });
    }
}

exports.userSkip = async (req, res, next) => {
    const { skippedUserId } = req.body;
    const issues = validate({ skippedUserId }, { skippedUserId:  { presence: true } });
    if (issues) return res.status(422).json({ error: issues });
    
    try {
        const result = await DiscoveryService.skipUser(req.user._id, skippedUserId);
        return res.status(200).json({ success: result.success, message: result.message, userId: skippedUserId });
    } catch (e) {
        if (e.status) return res.status(e.status).json({ error: e.message });
        return res.status(500).json({ error: e.message });
    }
}

exports.userLike = async (req, res, next) => {
    const { likedUserId } = req.body;
    const issues = validate({ likedUserId }, { likedUserId:  { presence: true } });
    if (issues) return res.status(422).json({ error: issues });

    try {
        const result = await DiscoveryService.likeUser(req.user._id, likedUserId);
        return res.status(200).json({
            success: result.success,
            message: result.message,
            userId: result.userId || likedUserId,
            conversationId: result.conversationId ?? null,
            matched: !!result.conversationId
        });
    } catch (e) {
        if (e.status) return res.status(e.status).json({ error: e.message });
        return res.status(500).json({ error: e.message });
    }
}

exports.userGet = async (req, res, next) => {
    const { id: userId } = req.params;
    const issues = validate({ userId }, { userId: { presence: true } });
    if (issues) return res.status(422).json({ error: issues });

    try {
        const user = await DiscoveryService.getUser(userId);

        res.json({ user });
    } catch (e) {
        if (e.status) return res.status(e.status).json({ error: e.message });
        return res.status(500).json({ error: e.message });
    }
}