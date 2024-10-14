import { WorkspaceModel, BoardModel, UserModel } from "../../models";
import { catchAsync } from "../../utils";
import { io, getReceiverSocketId } from "../../index";

export const emitToBoardMembers = (eventName: string) => {
  return catchAsync(async (req: any, res) => {
    const boardId = req.socket_board;
    const deletedBoard = req.socket_deleted_board;
    const userId = req.user._id;

    // Fetch the board details, selecting only the owner and members
    const board =
      eventName === "board deleted"
        ? deletedBoard
        : await BoardModel.findById(boardId).select("owner members");

    // Fetch all users with the "admin" role
    const admins = await UserModel.find({ role: "admin" }).select("_id");
    const adminIds = admins.map((admin) => admin._id.toString());

    // Create an array of all board members and the board owner
    let allRecipients = [
      board.owner.toString(),
      ...adminIds,
      ...board.members.map((member: any) => member.toString()),
    ];

    // Remove duplicates by converting to a Set, then back to an array
    allRecipients = [...new Set(allRecipients)];

    // Filter out the current user from the list of recipients
    const filterRecipientIds = allRecipients.filter(
      (id) => id !== userId.toString()
    );

    // Emit the event to all filtered members
    filterRecipientIds.forEach((member) => {
      const receiverSocketId = getReceiverSocketId(member); // Fetch socket ID of the user

      if (receiverSocketId) {
        io.to(receiverSocketId).emit(eventName);
      }
    });
  });
};

export const emitToWorkspaceMembers = (eventName: string) => {
  return catchAsync(async (req: any, res) => {
    const workspaceId = req.socket_workspace_id;
    const deletedWorkSpace = req.socket_deleted_workspace;
    const userId = req.user._id;

    // Fetch the board details, selecting only the owner and members
    const workspace = eventName.includes("deleted")
      ? deletedWorkSpace
      : await WorkspaceModel.findById(workspaceId).select("owner members");

    // Fetch all users with the "admin" role
    const admins = await UserModel.find({ role: "admin" }).select("_id");
    const adminIds = admins.map((admin) => admin._id.toString());

    // Create an array of all board members and the board owner
    let allRecipients = [
      workspace.owner.toString(),
      ...adminIds,
      ...workspace.members.map((member: any) => member.toString()),
    ];

    // Remove duplicates by converting to a Set, then back to an array
    allRecipients = [...new Set(allRecipients)];

    // Filter out the current user from the list of recipients
    const filterRecipientIds = allRecipients.filter(
      (id) => id !== userId.toString()
    );

    // Emit the event to all filtered members
    filterRecipientIds.forEach((member) => {
      const receiverSocketId = getReceiverSocketId(member); // Fetch socket ID of the user

      if (receiverSocketId) {
        io.to(receiverSocketId).emit(eventName);
      }
    });
  });
};
