## egg-account

主要特性依赖

- 登录、注册、退出
- 支持 ajax登录返回json
- 密码加密使用 bcrypt
- 国际化支持
- 依赖 egg-mongoose, egg-passport, egg-passport-local

### 使用

路由注册

```javascript
//MARK: 登录、注册、注销退出
  app.router.post('/passport', app.account.localAuthenticateMiddleware());
  app.router.post('/passport/register', app.account.signupMiddleware());
  app.router.post('/passport/logout', app.account.logoutMiddleware());
```

##### `app.account`

获取 account 管理对象


##### `app.account.userService`

获取 userService,比较基础，都要自定义

```javascript
const myUserService = {} // 你的userService
app.account.delegate(myUserService) // 重新设置 userSerivce
```