const LikeModel = require('./discovery.like.model');
const UserModel = require('../user/user.model');
const mongoose = require('mongoose');

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

exports.listLikers = async (userId) => {
    const limit = 20;
    try {
        const filter = {
            deleted: false,
            likes: { $elemMatch: { 
                    user: userId,
                    expiresAt: { $gt: new Date() },
                } 
            },
        };

        const list = await UserModel.aggregate([
            { $match: filter },
            { $project: {
                    deleted: 0,
                    password: 0,
                    refreshToken: 0,
                    likes: 0,
                    skips: 0,
                    matches: 0,
                    __v: 0,
                    createdDate: 0,
                    updatedDate: 0
                }
            },
            { $sample: { size: limit } },
        ]);
        
        return list;
    } catch (e) {
        throw(e);
    }
}