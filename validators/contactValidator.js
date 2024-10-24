import Joi from 'joi';

export const validateContact = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    timezone: Joi.string().required(),
  });
  return schema.validate(data);
};
