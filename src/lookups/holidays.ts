export const lookupHolidays = (
  yearNumber: number,
  monthNumber: number,
  view: string,
  specificDate: Date | null
) => {
  console.log("specificDate", specificDate);
  return {
    $lookup: {
      from: "holidays",
      let: { userId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $in: ["$$userId", "$users"] },
                ...(view === "month"
                  ? [
                      {
                        $gte: [
                          "$date",
                          new Date(yearNumber, monthNumber - 1, 1),
                        ],
                      },
                      { $lt: ["$date", new Date(yearNumber, monthNumber, 0)] },
                    ]
                  : [{ $eq: ["$date", specificDate] }]),
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
  };
};
