export const lookupAttendance = (
  year: number,
  month: number,
  view: string,
  specificDate: Date | null
) => ({
  $lookup: {
    from: "attendances",
    let: { userId: "$_id" },
    pipeline: [
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$user", "$$userId"] },
              ...(view === "month"
                ? [
                    {
                      $gte: ["$date", new Date(year, month - 1, 1)],
                    },
                    { $lt: ["$date", new Date(year, month, 1)] }, // Start of next month for exclusive upper bound
                  ]
                : specificDate
                  ? [
                      {
                        $eq: [
                          {
                            $dateToString: {
                              format: "%Y-%m-%d",
                              date: "$date",
                            },
                          },
                          {
                            $dateToString: {
                              format: "%Y-%m-%d",
                              date: specificDate,
                            },
                          },
                        ],
                      },
                    ]
                  : []),
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
