const UserModel = require('../user/user.model');
const mongoose = require('mongoose')
const LikeService = require('./discovery.like.service');
const MatchService = require('./discovery.match.service');
const LikeModel = require('./discovery.like.model');
const { toSafeUser } = require('../user/user.utils');

exports.discoverUser = async (userId, options = {}) => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const limit = parseInt(options.limit) || 20;

    try {
        const currUser = await UserModel.findById(userId);
        if (!currUser) throw { status: 404, message: 'User not found' };

        const recentFilter = (entry, field) => entry[field] > oneMonthAgo;

        const excluded = [
            currUser._id.toString(),
            ...currUser.matches.map(match => match.user.toString()),
            ...currUser.likes.filter(e => recentFilter(e, 'likedAt')).map(e => e.user.toString()),
            ...currUser.skips.filter(e => recentFilter(e, 'skippedAt')).map(e => e.user.toString()),
        ].map(id => new mongoose.Types.ObjectId(id));

        const matchStage = {
            _id: { $nin: excluded },
            deleted: false
        };

        const users = await UserModel.aggregate([
            { $match: matchStage },
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

        return users;
    } catch (e) {
        throw(e);
    }
}

exports.skipUser = async (userId, skippedUserId) => {
    try {
        const validUser = await UserModel.exists({ deleted: false, _id: skippedUserId });
        if (!validUser) throw { status: 404, message: 'User not found' };

        const alreadySkipped = await UserModel.exists({ _id: userId, 'skips.user': skippedUserId });
        if (alreadySkipped) return { success: false, message: 'Already skipped this user' };

        const alreadyLiked = await UserModel.exists({ _id: userId, 'likes.user': skippedUserId });
        if (alreadyLiked) return { success: false, message: 'Cannot skip already liked users' };

        const updatedUser = await UserModel
            .findByIdAndUpdate(
                userId,
                { $push: { skips: { user: skippedUserId, skippedAt: new Date() } } },
                { new: true },
            );
        if (!updatedUser) throw { status: 422, message: 'Unknown error occured' };

        return updatedUser;
    } catch (e) {
        throw (e);
    }
}

exports.likeUser = async (userId, likedUserId) => {
    try {
        const validUser = await UserModel.exists({ deleted: false, _id: likedUserId });
        if (!validUser) throw { status: 404, message: 'User not found' };

        const alreadyLiked = await UserModel.exists({ _id: userId, 'likes.user': likedUserId });
        if (alreadyLiked) return { success: false, message: 'Already liked this user' };

        const alreadySkipped = await UserModel.exists({ _id: userId, 'skips.user': likedUserId });
        if (alreadySkipped) return { success: false, message: 'Cannot like already skipped users' };

        const likes = await LikeService.handleLikes(userId, likedUserId);
        if (likes.matched) {
            const mutual = await MatchService.handleMutualLikes(userId, likedUserId);
            return { success: true, message: mutual.message, conversationId: mutual.conversationId }
        }

        await Promise.all([
            LikeModel.create({
                senderId: userId,
                recipientId: likedUserId,
                status: 'pending'
            }),
            UserModel.findByIdAndUpdate(
                userId,
                { $push: { likes: { user: likedUserId, likedAt: new Date() } } },
            ),
        ]);
        
        return { success: true, message: "You've sent a like!", userId: likedUserId };
    } catch (e) {
        if (e.code === 11000) {
            return { success: false, matched: false, message: 'Already liked or matched with this user' };
        }
        throw(e);
    }
 }

 exports.getUser = async (userId) => {
    try {
        const validUser = await UserModel.findOne({ deleted: false, _id: userId });
        if (!validUser) throw { status: 404, message: 'User not found' };

        const safeUser = toSafeUser(validUser);
        return safeUser;
    } catch (e) {
        throw(e);
    }
}