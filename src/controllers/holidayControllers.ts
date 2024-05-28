import { HolidayModal } from "../models";
import { AppError, AppResponse, ResponseStatus, catchAsync } from "../utils";

export const addHoliday = catchAsync(async (req, res) => {
  const { date } = req.body;

  const existingHoliday = await HolidayModal.findOne({ date });

  if (existingHoliday) {
    throw new AppError("Holiday already exists for this date", 409);
  }

  const newHoliday = await HolidayModal.create(req.body);

  return res
    .status(200)
    .json(
      new AppResponse(200, newHoliday, "Holiday Added", ResponseStatus.SUCCESS)
    );
});

export const getAllUserHolidays = catchAsync(async (req, res) => {
  const year = req.query.year
    ? parseInt(req.query.year as string)
    : new Date().getFullYear();

  // Calculate the start and end dates of the specified year
  const startDate = new Date(`${year}-01-01T00:00:00Z`);
  const endDate = new Date(`${year}-12-31T23:59:59Z`);

  // Find holidays within the date range and populate user references
  const holidays = await HolidayModal.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .populate("users", "full_name username avatar")
    .sort({ date: 1 });

  if (!holidays.length) {
    throw new AppError("No holidays found for the specified year", 409);
  }

  return res
    .status(200)
    .json(new AppResponse(200, holidays, "", ResponseStatus.SUCCESS));
});

export const getUserHolidays = catchAsync(async (req, res) => {
  const { _id } = req.params;

  console.log("_id", _id);
  const year = req.query.year
    ? parseInt(req.query.year as string)
    : new Date().getFullYear();

  console.log("year", year);

  // Calculate the start and end dates of the specified year
  const startDate = new Date(`${year}-01-01T00:00:00Z`);
  const endDate = new Date(`${year}-12-31T23:59:59Z`);

  // Find all holidays for the specified user
  const userHolidays = await HolidayModal.find({
    users: _id,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).select("-users");

  console.log("userHolidays", userHolidays);

  return res
    .status(200)
    .json(new AppResponse(200, userHolidays, "", ResponseStatus.SUCCESS));
});

export const updateHoliday = catchAsync(async (req, res) => {
  const { _id } = req.params;
  const { date } = req.body;

  // Check if a holiday with the same date already exists (excluding the current holiday)

  // const existingHoliday = await HolidayModal.findOne({ date });
  const existingHoliday = await HolidayModal.findOne({
    date,
    _id: { $ne: _id }, // Exclude the current holiday being updated
  });

  if (existingHoliday) {
    throw new AppError("A holiday with the same date already exists", 400);
  }

  const updatedHoliday = await HolidayModal.findByIdAndUpdate(_id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedHoliday) {
    throw new AppError("No Holiday found with that ID", 400);
  }

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        updatedHoliday,
        "Holiday Updated",
        ResponseStatus.SUCCESS
      )
    );
});

export const deleteHoliday = catchAsync(async (req, res) => {
  const { _id } = req.params;

  const holiday = await HolidayModal.findByIdAndDelete(_id);

  if (!holiday) {
    throw new AppError("No Holiday found with that ID", 400);
  }

  return res
    .status(200)
    .json(
      new AppResponse(200, null, "Holiday Deleted", ResponseStatus.SUCCESS)
    );
});
