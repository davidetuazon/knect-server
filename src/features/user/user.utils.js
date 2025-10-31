/**
 * returns safe user with sensitive fields ommited
 */
const toSafeUser = (userDoc) => {
    if (!userDoc) return null;
    const safeUser = userDoc.toObject();
    delete safeUser.skips;
    delete safeUser.likes;
    delete safeUser.matches;
    delete safeUser.password;
    delete safeUser.refreshToken;
    delete safeUser.__v;
    delete safeUser.createdDate;
    delete safeUser.updatedDate;
    return safeUser;
}

module.exports = {
    toSafeUser,
}