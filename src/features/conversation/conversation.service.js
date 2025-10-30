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
        }

        const conversation = await ConversationModel.paginate(filter, paginateOptions);

        return conversation || [];
    } catch (e) {
        throw(e);
    }
}

exports.create = async (userId, conversationId, recipientId, content, timestamp) => {
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