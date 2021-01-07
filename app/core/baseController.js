'use strict';

const { Controller } = require('egg');
class BaseController extends Controller {

  /**
   * 请求结果的统一处理
   *
   * @param {Object} option - 请求参数
   * @param {Number} [option.state] - http状态
   * @param {Object} option.data - 请求结果or错误的具体内容
   * @param {String} option.msg - 错误的文字信息
   * @param {String} option.code - 错误码
   *
   */
  result({ state, data, code, msg }) {
    const { ctx } = this;

    ctx.body = {
      code,
      msg,
      data: data || {},
    };

    ctx.status = state || 200;
  }

  /**
   * 请求成功的统一处理
   *
   * @param {Object} data - 返回值
   * @param {Object} [state] - http状态
   *
   */
  success(data, state) {
    const { ctx } = this;
    ctx.body = {
      code: '0',
      msg: 'OK',
      data: data || {},
    };
    ctx.status = state || 200;
  }

  /**
   * 请求失败的统一处理
   *
   * @description 与`this.result`的区别在于，它会根据code在`ctx.helper.errorCode`中查找并返回对应的错误信息
   *
   * @param {Object} option - 请求参数
   * @param {Number} [option.state] - http状态
   * @param {Object} [option.data] - 请求结果or错误的具体内容
   * @param {String} [option.msg] - 错误的文字信息
   * @param {String} [option.code] - 错误码
   *
   */
  failure({ state, data, code, msg }) {
    const { ctx } = this;

    ctx.body = {
      code,
      msg: msg || ctx.helper.errorCode[String(code)],
      data: data || {},
    };

    ctx.status = state || 200;
  }

  /**
   * 表单校验错误的统一处理
   *
   * @param {Object} error - 错误信息
   *
   */
  validateError(error) {
    const ctx = this.ctx;

    ctx.logger.info('表单校验错误：', error.errors);

    ctx.body = {
      code: '422',
      msg: ctx.helper.errorCode['422'],
      data: error.errors,
    };
    ctx.status = 422;
  }

}
module.exports = BaseController;
