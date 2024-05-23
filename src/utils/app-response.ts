export class AppResponse {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;
  data: any;
  message: string;
  success: string;

  constructor(
    statusCode: number,
    data: any,
    message = "Success",
    status: string
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = status;
  }
}
