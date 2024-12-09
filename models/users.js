const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        mingLength: 5,
        maxLength: 50,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        mingLength: 5,
        maxLength: 50,
    },
    password: {
        type: String,
        required: true,
        unique: true,
        mingLength: 5,
        maxLength: 1024,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        { _id: this._id, isAdmin: this.isAdmin },
        "jwtPrivateKey"
    );
    return token;
}

const User = mongoose.model('User', userSchema);

exports.User = User;