const LikeModel = require('./discovery.like.model');
const UserModel = require('../user/user.model');

exports.handleLikes = async (userId, likedUserId) => {
    try {
        const existingLike = await LikeModel.findOneAndUpdate(
            {
                senderId: likedUserId,
                recipientId: userId,
                status: 'pending',
            },
            { $set: { status: 'matched' } },
            { new: true },
        );

        if (existingLike) {
            await Promise.all([
                LikeModel.updateMany(
                    { senderId: { $in: [userId, likedUserId] }, recipientId: { $in: [userId, likedUserId] } },
                    { $set: { status: 'matched' } },
                ),
                UserModel.findByIdAndUpdate(likedUserId, { $pull: { likes: { user: userId } } }),
            ]);
            return { matched: true };
        }

        return { matched: false };
    } catch (e) {
        throw(e);
    }
}