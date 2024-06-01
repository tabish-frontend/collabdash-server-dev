export const lookupAttendance = (yearNumber: number, monthNumber: number) => ({
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
