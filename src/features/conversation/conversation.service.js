const MessageModel = require('./message.model');
const ConversationModel = require('./conversation.model');
const UserModel = require('../user/user.model');

exports.listConversations = async (userId) => {
    try {
        const filter = {
            deleted: false,
            participants: { $in: [userId] },
        };
        const paginateOptions = {
            page: 1,
            limit: 10,
            sort: { createdDate: -1 },
            lean: true,
            populate: [
                { path: 'participants', select: 'fullName profilePhoto', match: { _id: { $ne: userId } } }
            ]
        }

        const conversation = await ConversationModel.paginate(filter, paginateOptions);

        return conversation || [];
    } catch (e) {
        throw(e);
    }
}

exports.createMessage = async (userId, conversationId, recipientId, content, timestamp) => {
    if (!content) throw {status: 400, message: 'Missing message content' };
    try {
        const validUser = await UserModel.exists({ deleted: false, _id: recipientId});
        if (!validUser) throw { status: 404, message: 'User not found' };

        const existingConvo = await ConversationModel.exists({ deleted: false, _id: conversationId });
        if (!existingConvo) throw { status: 422, message: 'Unkown error occured' };

        const message = await MessageModel.create({
            conversationId,
            senderId: userId,
            recipientId,
            content,
            timestamp,
        });

        return message;
    } catch (e) {
        throw(e);
    }
}

exports.getConversation = async (userId, conversationId) => {
    try {
        const conversation = await ConversationModel.findOne({
            deleted: false,
            participants: { $in: userId },
            _id: conversationId,
        });
        if (!conversation) throw { status: 404, message: 'Conversation not found' };

        return conversation;
    } catch (e) {
        throw (e);
    }
}

exports.listMessages = async (userId, conversationId) => {
    try {
        const filter = {
            deleted: false,
            $or: [
              { senderId: userId },
              { recipientId: userId }  
            ],
            conversationId,
        }

        const paginateOptions = {
            sort: { timeStamp: -1 },
            lean: true,
        };

        const messages = await MessageModel.paginate(filter, paginateOptions);

        return messages || [];
    } catch (e) {
        throw (e);
    }
}