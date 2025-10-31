const cron = require('node-cron');
const mongoose = require('mongoose');
const UserModel = require('../../features/user/user.model');

const mongoURI = process.env.NODE_ENV === 'production' ? process.env.MONGO_URI : process.env.MONGO_URI_LOCAL;

if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(mongoURI, {
        maxPoolSize: 20,
        minPoolSize: 5,
        maxIdleTimeMS: 30_000,  // close idle connections after 30s
        waitQueueTimeoutMS: 5000,   // throw error if waiting time > 5s
    });
}

/**
 * cron job for cleaning up expired likes and skips in user model
 */
const removeExpiredLikesAndSkips = async () => {
    const now = new Date();

    try {
        const result = await UserModel.updateMany(
            {},
            {
                $pull: {
                    likes: { expiresAt: { $lt: now } },
                    skips: { expiresAt: { $lt: now } },
                }
            }
        );

        console.log(`Expired likes/skips removed: ${result.modifiedCount}`);
    } catch (e) {
        console.error('Error cleaning skips/likes: ', e);
    }
}

cron.schedule('0 0 * * *', removeExpiredLikesAndSkips);

console.log('Cron job for cleaning likes/skips started...');