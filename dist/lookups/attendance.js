"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupAttendance = void 0;
const lookupAttendance = (yearNumber, monthNumber) => ({
    $lookup: {
        from: "attendances",
        let: { userId: "$_id" },
        pipeline: [
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: ["$user", "$$userId"] },
                            { $gte: ["$date", new Date(yearNumber, monthNumber - 1, 1)] },
                            { $lt: ["$date", new Date(yearNumber, monthNumber, 0)] },
                        ],
                    },
                },
            },
            {
                $project: { createdAt: 0, updatedAt: 0, __v: 0 },
            },
        ],
        as: "attendance",
    },
});
exports.lookupAttendance = lookupAttendance;
//# sourceMappingURL=attendance.js.map