const UserModel = require('../user/user.model');
const ConversationModel = require('../conversation/conversation.model');

exports.handleMutualLikes = async (userId, likedUserId) => {
    const matchedAt = new Date();
    try {
        const existingConvo = await ConversationModel.findOne({
            deleted: false,
            participants: { $all: [userId, likedUserId] }
        });
        if (existingConvo) return { success: true, message: 'Already matched!', conversationId: existingConvo._id };

        await Promise.all([
            UserModel.updateOne(
                { _id: userId, 'matches.user': { $ne: likedUserId } },
                { $push: { matches: { user: likedUserId, matchedAt } } }
            ),
            UserModel.updateOne(
                { _id: likedUserId, 'matches.user': { $ne: userId } },
                { $push: { matches: { user: userId, matchedAt } } }
            ),
        ]);

        const conversation = await ConversationModel.create({
            participants: [userId, likedUserId],
        });
        if (!conversation) throw { status: 422, message: 'Unknown error occured' };

        return { success: true, message: "It's a match!", conversationId: conversation._id };
    } catch (e) {
        throw(e);
    }
}