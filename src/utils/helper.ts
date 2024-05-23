export const isFilesObject = (
  files: any
): files is { [fieldname: string]: Express.Multer.File[] } => {
  return files && typeof files === "object" && !Array.isArray(files);
};
