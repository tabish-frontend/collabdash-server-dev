export const lookupShift = () => ({
  $lookup: {
    from: "shifts",
    localField: "shift",
    foreignField: "_id",
    as: "shift",
  },
});
