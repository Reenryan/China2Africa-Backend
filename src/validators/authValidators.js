import { body } from "express-validator";
const { param } = require("express-validator");

const allowedBusinessTypes = [
  "INDIVIDUAL",
  "SMALL_BUSINESS",
  "WHOLESALER",
];

const validateOptionalText = (field, label, maxLength = 5000) =>
  body(field)
    .optional({ values: "null" })
    .isString()
    .withMessage(`${label} must be text.`)
    .bail()
    .trim()
    .isLength({ max: maxLength })
    .withMessage(`${label} must not exceed ${maxLength} characters.`);

const validateRequestItemText = (field, label) =>
  body(`items.*.${field}`)
    .optional({ values: "null" })
    .isString()
    .withMessage(`${label} must be text.`)
    .bail()
    .trim()
    .isLength({ max: 5000 })
    .withMessage(`${label} must not exceed 5000 characters.`);


const validateName = (field, label) =>
  body(field)
    .isString()
    .withMessage(`${label} must be text.`)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(`${label} is required.`)
    .bail()
    .isLength({ min: 1, max: 80 })
    .withMessage(`${label} must not exceed 80 characters.`)
    .bail()
    .matches(/^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u)
    .withMessage(`${label} contains invalid characters.`);

const validateEmail = () =>
  body("email")
    .isString()
    .withMessage("Email must be text.")
    .bail()
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address.")
    .bail()
    .normalizeEmail();

export const signupValidator = [
  validateName("firstName", "First name"),
  validateName("lastName", "Last name"),

  validateEmail(),

  body("businessType")
    .isString()
    .withMessage("Business type must be text.")
    .bail()
    .isIn(allowedBusinessTypes)
    .withMessage("Select a valid business type."),

  body("password")
  .isString()
  .withMessage("Password must be text.")
  .bail()
  .isLength({ min: 8, max: 12 })
  .withMessage("Password must contain between 8 and 12 characters.")
  .bail()
  .matches(/[A-Z]/)
  .withMessage("Password must contain an uppercase letter.")
  .bail()
  .matches(/[a-z]/)
  .withMessage("Password must contain a lowercase letter.")
  .bail()
  .matches(/[0-9]/)
  .withMessage("Password must contain a number.")
  .bail()
  .matches(/[^A-Za-z0-9]/)
  .withMessage("Password must contain a symbol.")
  .bail()
  .custom((value) => !/[\u0000-\u001F\u007F]/.test(value))
  .withMessage("Password contains invalid control characters.")
  .hide(),

  body("organizationName")
    .optional({ values: "null" })
    .isString()
    .withMessage("Organization name must be text.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Organization name cannot be blank.")
    .bail()
    .isLength({ max: 150 })
    .withMessage("Organization name must not exceed 150 characters.")
    .bail()
    .custom((value, { req }) => {
      if (
        ["SMALL_BUSINESS", "WHOLESALER"].includes(req.body.businessType) &&
        !value
      ) {
        throw new Error(
          "Organization name is required for this business type."
        );
      }

      return true;
    }),
];

export const loginValidator = [
  validateEmail(),

  body("password")
    .isString()
    .withMessage("Password is required.")
    .bail()
    .notEmpty()
    .withMessage("Password is required.")
    .hide(),
];

export const verifyEmailValidator = [
  validateEmail(),

  body("code")
    .isString()
    .withMessage("Verification code must be text.")
    .bail()
    .trim()
    .matches(/^\d{6}$/)
    .withMessage("Enter the six-digit verification code."),
];

export const resendVerificationValidator = [
  validateEmail(),
];


export const createSourcingRequestValidator = [
  validateOptionalText("customer_note", "Customer note"),

  body("items")
    .isArray({ min: 1, max: 100 })
    .withMessage(
      "A sourcing request must contain between 1 and 100 products."
    ),

  body("items.*")
    .isObject({ strict: true })
    .withMessage("Each product must be an object."),

  body("items.*.product_name")
    .isString()
    .withMessage("Product name must be text.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Product name is required.")
    .bail()
    .isLength({ max: 200 })
    .withMessage("Product name must not exceed 200 characters."),

  validateRequestItemText("description", "Product description"),

  validateRequestItemText("specifications", "Product specifications"),
];

export const getCustomerRequestByIdValidator = [
  param("requestId")
    .isUUID()
    .withMessage("Invalid sourcing request ID."),
];