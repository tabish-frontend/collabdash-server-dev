export const validationMessages = {
  required: "This field is required.",
  minLength: (length: number) =>
    `({PATH}) must be at least ${length} characters long.`,
  maxLength: (length: number) =>
    `({PATH}) must not exceed ${length} characters.`,
  minValue: (value: number) =>
    `({PATH}) must be greater than or equal to ${value}.`,
  maxValue: (value: number) =>
    `({PATH}) must be less than or equal to ${value}.`,
  email: "Invalid email address.",
  custom: (fieldName: string) => `Invalid ${fieldName}.`,
};
