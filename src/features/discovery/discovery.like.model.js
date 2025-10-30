const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const likeAsInviteSchema = new Schema(
    {
        deleted: {
            type: Boolean,
            default: false,
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
        status: {
            type: String,
            enum: ['pending', 'expired', 'matched'],
            default: 'pending',
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
    }, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' }}
);
likeAsInviteSchema.index({
    senderId: 1,
    recipientId: 1,
}, { unique: true });
likeAsInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
likeAsInviteSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Like', likeAsInviteSchema);