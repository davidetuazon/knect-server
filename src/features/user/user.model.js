const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        deleted: {
            type: Boolean,
            default: false,
        },
        fullName: String,
        age: {
            type: Number,
            required: true,
            min: 18,
            max: 100,
        },
        bio: {
            type: String,
            default: ''
        },
        profilePhoto: {
            type: String,
            default: ''
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
        },
        password: {
            type: String,
            required: true,
        },
        refreshToken: [
            {
                token: String,
                issuedAt: Date,
                expiresAt: Date,
            }
        ],
        likes: [{
                _id: false,
                user: {
                    type: mongoose.Types.ObjectId,
                    ref: 'User',
                },
                likedAt: Date,
        }],
        skips: [{
                _id: false,
                user: {
                    type: mongoose.Types.ObjectId,
                    ref: 'User',
                },
                skippedAt: Date,
        }],
        matches: [{
                _id: false,
                user: {
                    type: mongoose.Types.ObjectId,
                    ref: 'User',
                },
                matchedAt: Date,
        }],
    }, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } }
);
userSchema.index({
    fullName: 'text',
});
userSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('User', userSchema);