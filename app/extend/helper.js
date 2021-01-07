'use strict';

const crypto = require('crypto');

module.exports = {

  /**
  * 超出多少字的文本显示省略号
  *
  * @param {String} text - 文本内容
  * @param {Number} maxLength - 阈值
  * @return {String} 结果文本
  */
  textBeyondEllipsis(text, maxLength) {
    if (text.length <= maxLength) {
      return text;
    }

    return text.slice(0, maxLength) + '...';
  },

  /**
    * 分批次执行异步请求
    *
    * @description 由于Promise.all是一股脑的执行异步请求，故增加此工具函数
    *
    * @param {Number} poolLimit - 每次执行数量
    * @param {Array} array - 数据源数组
    * @param {Functin} iteratorFn - 执行函数
    * @return {Array} 执行结果数组
    */
  asyncPool(poolLimit, array, iteratorFn) {
    let i = 0;
    const ret = [];
    const executing = [];
    const enqueue = function() {
      if (i === array.length) {
        return Promise.resolve();
      }
      const item = array[i++];
      const p = Promise.resolve().then(() => iteratorFn(item, array));
      ret.push(p);
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      let r = Promise.resolve();
      if (executing.length >= poolLimit) {
        r = Promise.race(executing);
      }
      return r.then(() => enqueue());
    };
    return enqueue().then(() => Promise.all(ret));
  },

  /**
    * 过滤文本中的html标签
    *
    * @param {String} str - 需要过滤的文本
    * @return {String} 过滤后的文本
    */
  removeHTMLTag(str) {
    str = str.replace(/<\/?[^>]*>/g, ''); // 去除HTML tag
    str = str.replace(/[ | ]*\n/g, '\n'); // 去除行尾空白
    // str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
    str = str.replace(/&nbsp;/ig, '');// 去掉&nbsp;
    return str;
  },

  /**
    * 人工制造延迟
    *
    * @param {Number} timeountMS - 需要延迟多少毫秒
    * @return {Function} 需要被执行的functin
    */
  sleep(timeountMS) {
    return new Promise(resolve => {
      setTimeout(resolve, timeountMS);
    });
  },

  /**
  * 比较版本号
  *
  * @description if里写新版本的业务逻辑，else写老版本的业务逻辑。
  *
  * @param {String} currentVersion - 当前值（例如：1.1.0）
  * @param {String} boundaryVersion - 边界值（例如：1.0.0）
  * @param {Boolean} isStrict - 是否包含“等于”的情况，如果是false包含“等于”，默认为false
  * @return {Boolean} 如果current>=boundary返回true，否则为false
  */
  compareVersion(currentVersion, boundaryVersion, isStrict = false) {

    currentVersion = currentVersion.replace('_beta', ''); // 去除非生产环境末尾的_beta标识

    if (!isStrict && currentVersion === boundaryVersion) {
      return true;
    }

    const currentArr = currentVersion.split('.');
    const boundaryArr = boundaryVersion.split('.');

    for (let i = 0, l = currentArr.length; i < l; i++) {
      const current = Number(currentArr[i]);
      const boundary = Number(boundaryArr[i]);

      if (current !== boundary) {
        return current > boundary;
      }
    }

    return false;
  },

  /**
   * aes加密
   * @param {String} data - 加密内容
   * @param {String} key - 密钥
   * @return {String} 加密后的结果
   */
  aesEncrypt(data, key) {
    const iv = '';
    const cipherChunks = [];

    const cipher = crypto.createCipheriv('aes-128-ecb', key, iv);// 使用 aes-128-ecb 加密
    cipher.setAutoPadding(true); // 自动填充

    cipherChunks.push(cipher.update(data, 'utf8', 'base64'));
    cipherChunks.push(cipher.final('base64'));

    return cipherChunks.join('');
  },

  /**
   * aes解密
   * @param {String} encrypted - 加密内容
   * @param {String} key - 密钥
   * @return {String} 解密后的结果
   */
  aesDecrypt(encrypted, key) {
    const iv = '';
    const cipherChunks = [];

    const decipher = crypto.createDecipheriv('aes-128-ecb', key, iv);
    decipher.setAutoPadding(true);

    cipherChunks.push(decipher.update(encrypted, 'base64', 'utf8'));
    cipherChunks.push(decipher.final('utf8'));

    return cipherChunks.join('');
  },

  /**
   * 过滤object中为空的key
   *
   * @param {Object} data - 需要被过滤的对象
   * @param {Booble} isFilterEmptyString - 是否严格比对。如果为false，不过滤空字符串
   * @return {Object} 过滤后的结果
   */
  filterObjectEmptyValue(data, isFilterEmptyString = true) {
    const newData = {};

    for (const key in data) {
      const value = data[key];

      if (isFilterEmptyString) {
        if (value !== '' && value !== undefined && value !== null) {
          newData[key] = value;
        }
      } else {
        if (value !== undefined && value !== null) {
          newData[key] = value;
        }
      }
    }

    return newData;
  },

  /**
  * 手机号码中间部分替换成星号
  *
  * @param  {Number|String} phone - 手机号
  * @return {String} see 结果
  */
  formatPhone(phone) {
    if (!phone) {
      return '';
    }
    if (typeof phone === 'number') {
      phone = phone.toString();
    }

    return phone.substr(0, 3) + '****' + phone.substr(7, 11);
  },

  /**
  * 对数据分页进行格式化处理
  *
  * @param {Object} option - 传参对象
  * @param  {Array} option.resultList - 分页数据查询后的数据
  * @param  {Number} option.totalLength - 不做分页的情况数据的总长度
  * @param  {Number} option.pageSize - 每页输出多少条数据
  * @param  {Number} option.currentPage - 当前的页码
  * @return {Object} see 返回格式化后的数据对象
  */
  formatPaging({ resultList, totalLength, pageSize, currentPage, ...otherField }) {

    resultList = resultList || [];
    totalLength = totalLength || 0;
    pageSize = pageSize || 20;
    currentPage = currentPage || 1;

    return {
      list: resultList,
      pageSize: Number(pageSize),
      currentPage: Number(currentPage),
      total: Number(totalLength),
      totalPage: Math.ceil(totalLength / Number(pageSize)),
      ...otherField,
    };
  },

  /**
     * 产生随机数
     *
     * @param {Number} n - 指定n位数
     * @return {String} see 返回指定长度的字符串
     */
  randomNumber(n) {
    let str = '';

    for (let i = 0; i < n; i++) {
      str += Math.floor(Math.random() * 10);
    }

    return str;
  },

  errorCode: {
    200: '服务器成功返回请求的数据。',
    201: '新建或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '没有提供认证信息',
    403: '当前用户无此操作权限',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '表单校验错误',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',

    601: '数据库入库时，触发事务回滚',
  },
};
