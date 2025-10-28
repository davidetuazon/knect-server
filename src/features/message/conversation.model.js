const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
    {
        deleted: {
            type: Boolean,
            default: false,
        },
        participants: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'User',
                required: true,
            }
        ],
        lastMessage: {
            type: String,
        },
        lastTimeStamp: {
            type: Date,
            default: Date.now
        },
        unreadCounts: {
            type: Map,
            of: Number,
            default: {}
        }
    }, { timestamps : { createdAt: 'createdDate', updatedAt: 'updatedDate' } }
);
module.exports = mongoose.model('Conversation', conversationSchema);