import { TodosModel } from "../../models";
import { AppResponse, catchAsync, ResponseStatus } from "../../utils";

export const addTodos = catchAsync(async (req: any, res: any) => {
  const { title, date } = req.body;

  const owner = req.user._id;

  const newTodo = await TodosModel.create({
    title,
    date,
    owner,
  });

  return res
    .status(200)
    .json(new AppResponse(200, newTodo, "Todos Added", ResponseStatus.SUCCESS));
});

export const getTodos = catchAsync(async (req: any, res: any) => {
  const { date } = req.query;
  const owner = req.user._id;

  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  // Extract filters from req.query
  const filters = { date: { $gte: startOfDay, $lte: endOfDay }, owner };

  // Fetch todos with filters and user ID
  const allTodos = await TodosModel.find(filters);

  return res
    .status(200)
    .json(new AppResponse(200, allTodos, "", ResponseStatus.SUCCESS));
});

export const updateTodo = catchAsync(async (req: any, res: any) => {
  const { todoId } = req.params;

  const updateTodo = await TodosModel.findByIdAndUpdate(todoId, req.body, {
    new: true,
    runValidators: true,
  });

  // Check if the 'completed' field exists in the body
  const message = req.body.hasOwnProperty("completed")
    ? `Todo Mark as ${req.body.completed === true ? "Completed" : "Uncomplete"}`
    : "Todo Updated";

  return res
    .status(200)
    .json(new AppResponse(200, updateTodo, message, ResponseStatus.SUCCESS));
});

export const deleteTodo = catchAsync(async (req, res) => {
  const { todoId } = req.params;

  await TodosModel.findByIdAndDelete(todoId);

  return res
    .status(200)
    .json(new AppResponse(200, null, "Todo Deleted", ResponseStatus.SUCCESS));
});
