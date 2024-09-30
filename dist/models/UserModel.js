"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importStar(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const types_1 = require("../types");
const utils_1 = require("../utils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bankDetailsSchema = new mongoose_1.Schema({
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
    },
    iban_number: {
        type: Number,
        trim: true,
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
const userSchema = new mongoose_1.Schema({
    full_name: {
        type: String,
        trim: true,
        index: true,
        required: [true, utils_1.validationMessages.required],
        minlength: [3, utils_1.validationMessages.minLength(3)],
        maxlength: [40, utils_1.validationMessages.maxLength(40)],
    },
    username: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        index: true,
        required: [true, utils_1.validationMessages.required],
        minlength: [3, utils_1.validationMessages.minLength(3)],
        maxlength: [40, utils_1.validationMessages.maxLength(40)],
    },
    department: {
        type: String,
        default: "",
        required: [true, utils_1.validationMessages.required],
    },
    role: {
        type: String,
        trim: true,
        enum: ["employee", "manager", "hr", "admin"],
        default: types_1.Roles.HR,
    },
    email: {
        type: String,
        required: [true, utils_1.validationMessages.required],
        unique: true,
        trim: true,
        lowercase: true,
        maxlength: [40, utils_1.validationMessages.maxLength(40)],
        validate: [validator_1.default.isEmail, utils_1.validationMessages.email],
    },
    mobile: {
        type: String,
        trim: true,
        unique: true,
        required: [true, utils_1.validationMessages.required],
        min: [7, utils_1.validationMessages.minLength(7)],
        max: [12, utils_1.validationMessages.minLength(12)],
    },
    time_zone: {
        name: String,
        value: String,
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
        default: types_1.AccountStatus.Active,
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
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
// userSchema.pre<Query<any, any>>(/^find/, function (next) {
//   this.populate({
//     path: "shift",
//     select: "-__v",
//   });
//   next();
// });
// MIDDLEWARE == // PRE-SAVE HOOKS START
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password"))
            return next();
        this.password = yield bcryptjs_1.default.hash(this.password, 12);
        next();
    });
});
// METHODS
userSchema.methods.isPasswordCorrect = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcryptjs_1.default.compare(password, this.password);
    });
};
userSchema.methods.generateAccessToken = function () {
    const accessToken = jsonwebtoken_1.default.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        full_name: this.full_name,
        role: this.role,
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
    return accessToken;
};
exports.UserModel = mongoose_1.default.model("User", userSchema);
//# sourceMappingURL=UserModel.js.map