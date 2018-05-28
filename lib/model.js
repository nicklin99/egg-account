'use strict';
/**
 * mongodb 保存用户数据
 */
module.exports = app => {

    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;

    const UserSchema = new Schema({
        username: {
            type: String
        },
        mobile: {
            type: String
        },
        password: {
            type: String
        },
        created: {
            type: Date,
            default: Date.now,
        }
    });

    return mongoose.model('User', UserSchema);
}