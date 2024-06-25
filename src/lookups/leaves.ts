export const lookupLeaves = (
  yearNumber: number,
  monthNumber: number,
  view: string,
  specificDate: Date | null
) => ({
  $lookup: {
    from: "leaves",
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
                                "$endDate",
                                new Date(yearNumber, monthNumber, 1),
                              ],
                            },
                          ],
                        },
                        // {
                        //   $and: [
                        //     {
                        //       $gte: [
                        //         "$endDate",
                        //         new Date(yearNumber, monthNumber - 1, 1),
                        //       ],
                        //     },
                        //     {
                        //       $lt: [
                        //         "$endDate",
                        //         new Date(yearNumber, monthNumber, 1),
                        //       ],
                        //     },
                        //   ],
                        // },
                      ],
                    },
                  ]
                : specificDate
                  ? [
                      {
                        $or: [
                          { $eq: ["$startDate", specificDate] },
                          { $eq: ["$endDate", specificDate] },
                        ],
                      },
                    ]
                  : []),
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
