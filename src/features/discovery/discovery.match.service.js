const UserModel = require('../user/user.model');

exports.handleMutualLikes = async (userId, likedUserId) => {
    const matchedAt = new Date();
    try {
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

        return { success: true, message: "It's a match!", match: true };
    } catch (e) {
        throw(e);
    }
}