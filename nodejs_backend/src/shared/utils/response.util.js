/**
 * 统一API响应格式
 * @param {Object} res - Express响应对象
 * @param {number} statusCode - HTTP状态码
 * @param {string} message - 响应信息
 * @param {any} data - 可选，响应数据
 */

export const response = (res, statusCode, msg, data = null) => {
  const code = statusCode;
  const responseBody = { code, msg };
  if (data !== null) {
    responseBody.data = data;
  }

  return res.status(statusCode).json(responseBody);
};
