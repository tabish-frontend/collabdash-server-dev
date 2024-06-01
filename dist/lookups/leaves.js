"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupLeaves = void 0;
const lookupLeaves = (yearNumber, monthNumber) => ({
    $lookup: {
        from: "leaves",
        let: { userId: "$_id" },
        pipeline: [
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: ["$user", "$$userId"] },
                            {
                                $or: [
                                    {
                                        $and: [
                                            {
                                                $gte: [
                                                    "$startDate",
                                                    new Date(yearNumber, monthNumber - 1, 1),
                                                ],
                                            },
                                            {
                                                $lt: [
                                                    "$startDate",
                                                    new Date(yearNumber, monthNumber, 1),
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        $and: [
                                            {
                                                $gte: [
                                                    "$endDate",
                                                    new Date(yearNumber, monthNumber - 1, 1),
                                                ],
                                            },
                                            {
                                                $lt: ["$endDate", new Date(yearNumber, monthNumber, 1)],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    startDate: 1,
                    endDate: 1,
                    reason: 1,
                    status: 1,
                    leave_type: 1,
                },
            },
        ],
        as: "leaves",
    },
});
exports.lookupLeaves = lookupLeaves;
//# sourceMappingURL=leaves.js.map