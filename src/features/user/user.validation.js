const register = {
    fullName: {
        presence: { allowEmpty: false, message: 'cannot be blank' },
        length: { minimum: 2, message: 'must be at least 2 characters'},
    },
    age: {
        presence: { allowEmpty: false, message: 'is required' },
        numericality: {
            onlyInteger: true,
            greaterThanOrEqualTo: 18,
            message: 'Must be 18 or older',
        },
    },
    email: {
        presence: { allowEmpty: false, message: 'is required' },
        email : { message: 'is not valid' },
    },
    password: {
        presence: { allowEmpty: false, message: 'is required' },
        length: { minimum: 8, message: 'Password must be at least 8 characters' },
    }
}

const signIn = {
    email: {
        presence: { allowEmpty: false, message: 'is required' },
    },
    password: {
        presence: { allowEmpty: false, message: 'is required' },
    },
}

const profileUpdate = {
    fullName: {
        presence: { allowEmpty: false, message: 'cannot be blank' },
        length: { minimum: 1, message: 'cannot be empty' },
    },
    bio: {
        length: { maximum: 350, allowEmpty: true }
    }
}

module.exports = {
    register,
    signIn,
    profileUpdate,
}