import { HolidayModel, LeavesModel, ShiftModel } from "../models";
import { ObjectId } from "mongoose";
import { AppError, LeavesStatus } from "../utils";

export const isFilesObject = (
  files: any
): files is { [fieldname: string]: Express.Multer.File[] } => {
  return files && typeof files === "object" && !Array.isArray(files);
};

export async function checkHoliday(
  userId: ObjectId,
  startOfDay: Date,
  endOfDay: Date
): Promise<void> {
  const isHoliday = await HolidayModel.findOne({
    users: userId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });
  if (isHoliday) {
    throw new AppError("Cannot mark attendance on a Holiday", 400);
  }
}

export async function checkLeave(
  userId: ObjectId,
  startOfDay: Date,
  endOfDay: Date
): Promise<void> {
  const isOnLeave = await LeavesModel.findOne({
    user: userId,
    status: LeavesStatus.Approved,
    startDate: { $lte: endOfDay },
    endDate: { $gte: startOfDay },
  });
  if (isOnLeave) {
    throw new AppError("Cannot mark attendance on Leave", 400);
  }
}

export async function checkShift(
  userId: ObjectId,
  currentDay: string,
  currentTime: number
): Promise<void> {
  const shift = await ShiftModel.findOne({ user: userId });
  if (shift) {
    if (shift.weekends.includes(currentDay)) {
      throw new AppError(
        `Cannot mark attendance on a weekend (${currentDay})`,
        400
      );
    }

    const shiftMatch = shift.times.some((timeDetail) => {
      const shiftStart = new Date(timeDetail.start).getTime();
      const shiftEnd = new Date(timeDetail.end).getTime();
      return (
        timeDetail.days.includes(currentDay) &&
        currentTime >= shiftStart &&
        currentTime <= shiftEnd
      );
    });

    if (!shiftMatch) {
      throw new AppError(
        "Current time does not match your shift schedule",
        400
      );
    }
  } else {
    throw new AppError(`Shifts were not added`, 400);
  }
}

export const getDatesInMonth = (month: any, year: any) => {
  const dates = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month - 1, i);
    const formattedDate = date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      })
      .replace(/ /g, " ");
    dates.push(formattedDate);
  }
  return dates;
};

export const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};
