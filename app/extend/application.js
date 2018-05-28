'use strict';

const AccountPassport = require('./../../lib/account');
const UserService = require('./../../lib/user');
const UserModel = require('./../../lib/model');

const ACCOUNT_PASSPORT = Symbol('Application#AccountPassport');

module.exports = {

  get is_dev() {
    if (this.config.env === 'local' || this.config.env === 'unittest') {
      return true;
    }

    return false;
  },

  // 重写此方法自定义 AccountPassport 与 UserService
  get account() {
    if (!this[ACCOUNT_PASSPORT]) {
      this[ACCOUNT_PASSPORT] = new AccountPassport();
      const service = new UserService(this.createAnonymousContext());
      service.model = UserModel(this);
      this[ACCOUNT_PASSPORT].delegate(service);
    }
    return this[ACCOUNT_PASSPORT];
  },


};