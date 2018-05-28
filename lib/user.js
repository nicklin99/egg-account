'use strict';

const Service = require('egg').Service;
const PasswordHash = require('./hash');

const USER_MODEL = Symbol('UserService#userModel');
const Password_Delegate = Symbol('AccountPassport#password');

class UserService extends Service {

    get model() {
        return this[USER_MODEL];
    }

    set model(model) {
        this[USER_MODEL] = model;
    }

    get passwordHasher() {
        if (!this[Password_Delegate]) {
            this[Password_Delegate] = new PasswordHash();
        }
        return this[Password_Delegate];
    }

    // { provider: 'local', username: '1111111', password: '1' }
    async attempt(user) {

        const existsUser = await this.model.findOne({
            username: user.username,
        });

        if (!existsUser) {
            this.ctx.throw(401, this.ctx.__('authenticate_error'));
        }

        if (existsUser) {
            const hash = existsUser.password;

            const match = await this.passwordHasher.check(user.password, hash);

            if (match) {
                return existsUser;
            }

            this.ctx.throw(401, this.ctx.__('authenticate_error'));
        }

        const adminUser = this.addFirstAdmin(user);

        if (adminUser) {
            return adminUser;
        }

        this.ctx.throw(401, this.ctx.__('authenticate_error'));
    }

    /**
     * 第一个注册的成为管理员
     * @param {Object} user 账号信息
     */
    async addFirstAdmin(user) {
        const count = await this.model.count({});

        if (count > 0) {
            return false;
        } else {
            user.password = await this.model.hash(user.password)
            const newUser = await this.model.create(user);
            return newUser;
        }
    }

    /**
     * 添加用户
     * @param {Object} user 用户信息
     *   {String} query 指定注册方式 mobile email username
     */
    async add(user) {
        const querys = this.app.config.account.querys;
        const query = user.query ? user.query : this.app.config.account.query;

        const query_value = user.query;

        var exist = true;

        if (this.app.is_dev) {
            this.app.logger.info('add.user', query);
        }

        if (query_value && querys.indexOf(query) != -1) {
            switch (query) {
                case 'mobile':
                    exist = await this.existMobile(query_value);
                    break;
                case 'email':
                    exist = await this.existEmail(query_value);
                    break;
                case 'username':
                    exist = await this.existUsername(query_value);
                    break;
                default:
                    break;
            }
        }

        if (exist) {
            return false;
        }

        // 验证参数

        return await this.create(user);
    }

    /**
     * 创建用户记录
     * @param {Object} user 用户基本信息
     */
    async create(user) {
        this.ctx.validate({
            password: {
                type: 'password',
                compare: 'password_confirm',
            }
        }, user);

        const password = user.password;
        user.password = await this.passwordHasher.hash(password);
        return await this.model.create(user);
    }

    //MARK: 是否存在用户

    async existMobile(mobile) {
        const query = {
            mobile: mobile,
        }

        this.ctx.validate({
            mobile: {
                type: 'id',
            },
        }, query);

        return await existUser({
            mobile: mobile,
        })
    }

    async existUsername(username) {
        const query = {
            username: username,
        }

        if (this.app.is_dev) {
            this.app.logger.info('existUsername');
            this.app.logger.info(query);
        }

        this.ctx.validate({
            username: {
                type: 'string',
            },
        }, query);

        return await this.existUser(query);
    }

    async existEmail(email) {
        const query = {
            email: email
        }

        this.ctx.validate({
            email: {
                type: 'email',
            },
        }, query);

        return await this.existUser(query);
    }

    async existUser(query) {
        return await this.model.findOne(query);
    }
}

module.exports = UserService;