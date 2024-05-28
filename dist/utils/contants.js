"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TUITION_HIGHWAY = exports.DB_Name = exports.ExcludedFields = exports.LeavesTypes = exports.LeavesStatus = exports.AttendanceStatus = exports.HttpOptions = exports.ResponseStatus = void 0;
exports.ResponseStatus = {
    SUCCESS: "success",
    ERROR: "error",
    FAIL: "fail",
};
exports.HttpOptions = {
    httpOnly: true,
    secure: true,
};
exports.AttendanceStatus = {
    ONLINE: "online",
    SHORT_ATTENDANCE: "short_attendance",
    FULL_DAY_ABSENT: "full_day_absent",
    HALF_DAY_PRESENT: "half_day_present",
    FULL_DAY_PRESENT: "full_day_present",
};
exports.LeavesStatus = {
    Pending: "pending",
    Approved: "approved",
    Declined: "declined",
};
exports.LeavesTypes = {
    Sick: "sick",
    Casual: "casual",
    Half_Day: "half_day",
    Emergency: "emergency",
};
exports.ExcludedFields = "-password -__v -refresh_token -createdAt -updatedAt";
exports.DB_Name = "WorkDock";
exports.TUITION_HIGHWAY = "Tuition Highway";
//# sourceMappingURL=contants.js.map