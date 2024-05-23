import createDOMPurify from "dompurify";
import { NextFunction, Request, Response } from "express";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

function sanitize(input: string): string {
  const sanitizedHTML = DOMPurify.sanitize(input);
  const parsedContent = new JSDOM(sanitizedHTML);
  return parsedContent.window.document.body.textContent || "";
}

export function xssMiddleware(req: Request, res: Response, next: NextFunction) {
  // Sanitize body
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitize(req.body[key]);
      }
    }
  }

  // Sanitize query parameters
  if (req.query) {
    for (let key in req.query) {
      if (typeof req.query[key] === "string") {
        req.query[key] = sanitize(req.query[key] as string); // Type assertion here
      }
    }
  }

  // Sanitize URL parameters
  if (req.params) {
    for (let key in req.params) {
      if (typeof req.params[key] === "string") {
        req.params[key] = sanitize(req.params[key]);
      }
    }
  }

  next();
}
