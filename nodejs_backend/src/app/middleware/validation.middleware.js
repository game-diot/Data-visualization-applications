// import { errorHandler } from "./error.middleware.js";
// import Joi from "joi";

// export const validateFile = (req, res, next) => {
//   const schema = Joi.object({
//     originName: Joi.string().required(),
//     storeName: Joi.string().required(),
//     path: Joi.string().required(),
//     size: Joi.number().required(),
//     status: Joi.string()
//       .valid("updated", "process", "failed")
//       .default("updated"),
//     updateTime: Joi.date().default(Date.now),
//   });
//   const { error } = schema.validate(req.body);
//   if (error)
//     return errorHandler(res, `参数错误：${error.details[0].message}`, 400);
//   next();
// };
