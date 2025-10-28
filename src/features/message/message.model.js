const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const messageSchema = new Schema(
    {
        deleted: {
            type: Boolean,
            default: false,
        },
        conversationId: {
            type: mongoose.Types.ObjectId,
            ref: 'Conversation',
            required: true,
        },
        senderId: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        recipientId: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        }
    }, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } },
);
messageSchema.index({
    senderId: 1,
    recipientId: 1,
    timestamp: 1,
});
messageSchema.index({
    conversationId: 1,
    timestamp: 1
});
messageSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Message', messageSchema);
