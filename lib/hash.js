'use strict';


const bcrypt = require('bcrypt');

const saltRounds = 10;

module.exports = class PasswordHash {

    /**
     * 加密密码
     * @param {String} password 密码
     */
    async hash(password) {
        return await bcrypt.hash(password, saltRounds);
    }

    /**
     * 密码是否一致
     * @param {String} password 输入密码
     */
    async check(password, hash) {
        return await bcrypt.compare(password, hash);
    }



}