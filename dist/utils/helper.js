"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFilesObject = void 0;
const isFilesObject = (files) => {
    return files && typeof files === "object" && !Array.isArray(files);
};
exports.isFilesObject = isFilesObject;
//# sourceMappingURL=helper.js.map