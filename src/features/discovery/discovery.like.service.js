const LikeModel = require('./discovery.like.model');
const UserModel = require('../user/user.model');

exports.handleLikes = async (userId, likedUserId) => {
    try {
        const alreadyMatched = await LikeModel.findOne({
            deleted: false,
            senderId: { $in: [userId, likedUserId] },
            recipientId: { $in: [userId, likedUserId] },
            status: 'matched',
        });
        if (alreadyMatched) return { 
                success: false,
                message: 'You are currently matched with this user',
                userId: likedUserId,
                matched: true,
            } 

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