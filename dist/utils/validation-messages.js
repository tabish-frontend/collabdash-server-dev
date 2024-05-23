"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationMessages = void 0;
exports.validationMessages = {
    required: "This field is required.",
    minLength: (length) => `({PATH}) must be at least ${length} characters long.`,
    maxLength: (length) => `({PATH}) must not exceed ${length} characters.`,
    minValue: (value) => `({PATH}) must be greater than or equal to ${value}.`,
    maxValue: (value) => `({PATH}) must be less than or equal to ${value}.`,
    email: "Invalid email address.",
    custom: (fieldName) => `Invalid ${fieldName}.`,
};
//# sourceMappingURL=validation-messages.js.map