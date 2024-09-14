"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.xssMiddleware = void 0;
const dompurify_1 = __importDefault(require("dompurify"));
const jsdom_1 = require("jsdom");
const window = new jsdom_1.JSDOM("").window;
const DOMPurify = (0, dompurify_1.default)(window);
function sanitize(input) {
    const sanitizedHTML = DOMPurify.sanitize(input);
    const parsedContent = new jsdom_1.JSDOM(sanitizedHTML);
    return parsedContent.window.document.body.textContent || "";
}
function xssMiddleware(req, res, next) {
    // Sanitize body, skipping the 'description' field
    if (req.body) {
        for (let key in req.body) {
            if (key !== "description" && typeof req.body[key] === "string") {
                req.body[key] = sanitize(req.body[key]);
            }
        }
    }
    // Sanitize query parameters
    if (req.query) {
        for (let key in req.query) {
            if (typeof req.query[key] === "string") {
                req.query[key] = sanitize(req.query[key]);
            }
        }
    }
    // Sanitize URL parameters
    if (req.params) {
        for (let key in req.params) {
            if (typeof req.params[key] === "string") {
                req.params[key] = sanitize(req.params[key]);
            }
        }
    }
    next();
}
exports.xssMiddleware = xssMiddleware;
//# sourceMappingURL=xss-sanitize.js.map