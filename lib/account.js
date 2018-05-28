'use strict';

/**
 * 账号管理类
 */

const User_Service_Delegate = Symbol('AccountPassport#userServiceDelegate');
const PASSPORT_INSTANCE = Symbol('AccountPassport#passport');

module.exports = class AccountPassport {

    //MARK: 账号密码登录

    get userService() {
        return this[User_Service_Delegate];
    }

    set userService(service) {
        this[User_Service_Delegate] = service;
    }

    delegate(userService) {
        this.userService = userService;
    }

    /**
     * 密码登录验证中间件,不使用 passport-local 有点繁琐，不灵活
     * @param {*} passport 
     * @param {*} options 
     */
    localAuthenticateMiddleware(passport, options) {

        const passportAuthenticate = async (ctx, next) => {
            const username = ctx.request.body.username;
            const password = ctx.request.body.password;

            const userData = {
                provider: 'local',
                username,
                password,
            };

            const user = await this.userService.attempt(userData);

            ctx.coreLogger.info('authenticated.user %j', user);
            ctx.coreLogger.info(ctx.req.login);

            ctx.req.login(user, options, function (err) {
                if (err) {
                    return next(err);
                }

                const is_ajax = true;

                function complete() {
                    // ajax 返回结果由客户端处理跳转
                    if (is_ajax) {
                        ctx.body = {
                            code: 0,
                            message: ctx.__('login_success'),
                        };
                        ctx.status = 200;
                        return next();
                    }

                    // 非 ajax 直接跳转处理
                    if (options.successReturnToOrRedirect) {
                        var url = options.successReturnToOrRedirect;
                        if (ctx.req.session && ctx.req.session.returnTo) {
                            url = ctx.req.session.returnTo;
                            delete ctx.req.session.returnTo;
                        }
                        return ctx.res.redirect(url);
                    }

                    if (options.successRedirect) {
                        return ctx.res.redirect(options.successRedirect);
                    }

                    next();
                }

                complete();
            });
        }

        return passportAuthenticate;
    }

    // 注册中间件
    signupMiddleware() {
        const signup = async (ctx, next) => {
            const post = ctx.request.body;
            await this.signup(post);
        }
        return signup;
    }

    // 注册API，默认使用 username 注册
    async signup(post) {
        post.query = 'username';
        const user = await this.userService.add(post);

        if (user) {
            this.ctx.body = {
                code: 0,
                data: {},
            };
        }
    }

    /**
     * 注销退出中间件
     */
    logoutMiddleware() {
        const logout = async (ctx, next) => {
            ctx.logout();
        }
        return logout;
    }

    //MARK: 微信登录 TODO


    //MARK: 支付宝登录 TODO

    //MARK: 微博登录 TODO
}