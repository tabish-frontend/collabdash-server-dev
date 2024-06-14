import bcrypt from "bcryptjs";
import mongoose, { Query, Schema } from "mongoose";
import validator from "validator";
import { Roles, AccountStatus, User, BankDetails } from "../types";
import { validationMessages } from "../utils";
import jwt from "jsonwebtoken";

const bankDetailsSchema: Schema<BankDetails> = new Schema<BankDetails>({
  bank_name: {
    type: String,
    required: [true, "Please provide the bank name"],
    trim: true,
  },
  account_holder_name: {
    type: String,
    required: [true, "Please provide the account holder name"],
    trim: true,
  },
  account_number: {
    type: Number,
    required: [true, "Please provide the account number"],
    trim: true,
    unique: true,
  },
  iban_number: {
    type: Number,
    trim: true,
    unique: true,
  },
  city: {
    type: String,
    trim: true,
  },
  branch: {
    type: String,
    trim: true,
  },
});

const userSchema: Schema<User> = new Schema<User>(
  {
    full_name: {
      type: String,
      trim: true,
      index: true,
      required: [true, validationMessages.required],
      minlength: [3, validationMessages.minLength(3)],
      maxlength: [40, validationMessages.maxLength(40)],
    },
    username: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      index: true,
      required: [true, validationMessages.required],
      minlength: [3, validationMessages.minLength(3)],
      maxlength: [40, validationMessages.maxLength(40)],
    },
    department: {
      type: String,
      default: "",
      required: [true, validationMessages.required],
    },
    role: {
      type: String,
      trim: true,
      enum: ["employee", "manager", "hr", "admin"],
      default: Roles.HR,
    },
    email: {
      type: String,
      required: [true, validationMessages.required],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [40, validationMessages.maxLength(40)],
      validate: [validator.isEmail, validationMessages.email],
    },
    mobile: {
      type: String,
      trim: true,
      unique: true,
      required: [true, validationMessages.required],
      min: [7, validationMessages.minLength(7)],
      max: [12, validationMessages.minLength(12)],
    },
    company: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      trim: true,
      default: "",
    },
    designation: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: "",
    },
    dob: {
      type: Date,
      default: "",
    },
    country: {
      type: String,
      trim: true,
    },
    languages: {
      type: [String],
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    national_identity_number: {
      type: Number,
      trim: true,
      unique: true,
      required: [true, "Please provide valid NIC number"],
    },
    bank_details: {
      type: bankDetailsSchema,
    },
    account_status: {
      type: String,
      trim: true,
      default: AccountStatus.Active,
    },
    join_date: {
      type: Date,
      default: Date.now(),
    },
    leave_date: {
      type: Date,
      default: "",
    },
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      default: null,
    },
    qualification_certificates: { type: [String], default: [] },
    qualification: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre<Query<any, any>>(/^find/, function (next) {
  this.populate({
    path: "shift",
    select: "-__v",
  });

  next();
});

// MIDDLEWARE == // PRE-SAVE HOOKS START
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// METHODS
userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  const accessToken = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      full_name: this.full_name,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );

  return accessToken;
};

export const UserModel = mongoose.model<User>("User", userSchema);
