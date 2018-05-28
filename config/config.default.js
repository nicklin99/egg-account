'use strict';


module.exports = () => {
  return {
    account: {
      queryField: 'mobile', // 默认查询字段
      querys: ['mobile', 'username'], // 唯一字段
    }
  }
}