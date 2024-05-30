export const ResponseStatus = {
  SUCCESS: "success",
  ERROR: "error",
  FAIL: "fail",
};

export const HttpOptions = {
  httpOnly: true,
  secure: true,
};

export const AttendanceStatus = {
  ONLINE: "online",
  SHORT_ATTENDANCE: "short_attendance",
  FULL_DAY_ABSENT: "full_day_absent",
  HALF_DAY_PRESENT: "half_day_present",
  FULL_DAY_PRESENT: "full_day_present",
};

export const LeavesStatus = {
  Pending: "pending",
  Approved: "approved",
  Rejected: "rejected",
};

export const LeavesTypes = {
  Sick: "sick",
  Casual: "casual",
  Half_Day: "half_day",
  Emergency: "emergency",
};

export const ExcludedFields =
  "-password -__v -refresh_token -createdAt -updatedAt";

export const DB_Name = "WorkDock";

export const TUITION_HIGHWAY = "Tuition Highway";
