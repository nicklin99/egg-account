'use strict';

const path = require('path');

module.exports = app => {
    if (app.is_dev) {
        app.mongoose.set('debug', true);
    }
};