import { TaskModel, MeetingModel } from "../../models"; // Adjust the import paths based on your project structure
import { catchAsync } from "../../utils"; // Assuming you have a catchAsync utility
import { Request, Response } from "express"; // Importing types for request and response

export const getAllCalendarEvents = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user._id;

    // Build the query to fetch tasks where the user is either the owner or assigned
    const taskQuery = {
      $or: [{ owner: userId }, { assignedTo: userId }],
    };

    // Build the query to fetch meetings where the user is either the owner or a participant
    const meetingQuery = {
      $or: [{ owner: userId }, { participants: userId }],
    };

    // Fetch tasks and meetings concurrently
    const [tasks, meetings] = await Promise.all([
      TaskModel.find(taskQuery)
        .populate("assignedTo", "full_name username avatar")
        .populate("owner", "full_name username avatar"),
      MeetingModel.find(meetingQuery)
        .populate("participants", "full_name username avatar")
        .populate("owner", "full_name username avatar"),
    ]);

    // Transform tasks and meetings into the desired format
    const taskEvents = tasks.map((task) => ({
      id: task._id,
      start: task.dueDate,
      end: new Date(task.dueDate.getTime() + 1 * 60 * 60 * 1000), // Add 2 hours to the dueDate
      title: task.title,
      color: "#F79009",
      type: "task",
      details: task, // Include the entire task object for additional details
    }));

    const meetingEvents = meetings.map((meeting) => ({
      id: meeting._id,
      start: meeting.time,
      end: new Date(meeting.time.getTime() + 2 * 60 * 60 * 1000), // Add 1 hour to the meeting time
      title: meeting.title,
      color: "#0a8263",
      type: "meeting",
      details: meeting, // Include the entire meeting object for additional details
    }));

    // Merge taskEvents and meetingEvents into a single array
    const events = [...taskEvents, ...meetingEvents];

    // Respond with the merged events
    res.status(200).json({
      status: "success",
      data: {
        events,
      },
    });
  }
);

//////////// with filters

// import { TaskModel } from "../../models"; // Adjust the import path based on your project structure
// import { catchAsync } from "../../utils"; // Assuming you have a catchAsync utility
// import { Request, Response } from "express"; // Importing types for request and response

// export const getAllCalendarEvents = catchAsync(
//   async (req: Request, res: Response) => {
//     const { view, date }: any = req.query; // Explicitly type the query parameters
//     const userId = req.user._id;

//     console.log("view", view);
//     console.log("date", date);

//     // Build the query object
//     const query: any = {
//       $or: [{ owner: userId }, { assignedTo: userId }],
//     };

//     // Filter by view and date if view is 'day' or 'week'
//     if (view === "day" && date) {
//       const specificDate = new Date(date);
//       const startOfDay = new Date(specificDate.setHours(0, 0, 0, 0)); // Start of the day
//       const endOfDay = new Date(specificDate.setHours(23, 59, 59, 999)); // End of the day

//       console.log("startOfDay", startOfDay);
//       console.log("endOfDay", endOfDay);

//       // Update the query to check if the specified date falls within createdAt or dueDate
//       query.$expr = {
//         $or: [
//           {
//             $and: [
//               { $lte: ["$createdAt", endOfDay] },
//               { $gte: ["$createdAt", startOfDay] },
//             ],
//           },
//           {
//             $and: [
//               { $lte: ["$dueDate", endOfDay] },
//               { $gte: ["$dueDate", startOfDay] },
//             ],
//           },
//           {
//             $and: [
//               { $lte: ["$createdAt", endOfDay] },
//               { $gte: ["$dueDate", startOfDay] },
//             ],
//           },
//         ],
//       };
//     } else if (view === "week" && date) {
//       const specificDate = new Date(date);
//       const startOfWeek = new Date(specificDate.setHours(0, 0, 0, 0)); // Start of the week
//       const endOfWeek = new Date(startOfWeek); // Create a copy for end of week
//       endOfWeek.setDate(endOfWeek.getDate() + 7); // Add 7 days to get the end of the week

//       console.log("startOfWeek", startOfWeek);
//       console.log("endOfWeek", endOfWeek);

//       // Update the query to check if the specified week falls within createdAt or dueDate
//       query.$expr = {
//         $or: [
//           {
//             $and: [
//               { $lte: ["$createdAt", endOfWeek] },
//               { $gte: ["$createdAt", startOfWeek] },
//             ],
//           },
//           {
//             $and: [
//               { $lte: ["$dueDate", endOfWeek] },
//               { $gte: ["$dueDate", startOfWeek] },
//             ],
//           },
//           {
//             $and: [
//               { $lte: ["$createdAt", endOfWeek] },
//               { $gte: ["$dueDate", startOfWeek] },
//             ],
//           },
//         ],
//       };
//     }

//     // Fetch tasks from TaskModel
//     const tasks = await TaskModel.find(query)
//       .populate("assignedTo", "full_name username avatar")
//       .populate("owner", "full_name username avatar");

//     console.log("tasks", tasks);

//     // Respond with the fetched tasks
//     res.status(200).json({
//       status: "success",
//       data: {
//         tasks,
//       },
//     });
//   }
// );
