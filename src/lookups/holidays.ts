export const lookupHolidays = (yearNumber: number, monthNumber: number) => ({
  $lookup: {
    from: "holidays",
    let: { userId: "$_id" },
    pipeline: [
      {
        $match: {
          $expr: {
            $and: [
              { $in: ["$$userId", "$users"] },
              { $gte: ["$date", new Date(yearNumber, monthNumber - 1, 1)] },
              { $lt: ["$date", new Date(yearNumber, monthNumber, 0)] },
            ],
          },
        },
      },
      {
        $project: { _id: 1, title: 1, date: 1 },
      },
    ],
    as: "holidays",
  },
});
