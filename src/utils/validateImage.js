
import { fileTypeFromBuffer } from "file-type";
import AppError from "../utils/AppError.js";

const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export const validateImage = async (file) => {
  if (!file || !Buffer.isBuffer(file.buffer)) {
    throw new AppError(
      "A valid image file is required.",
      400,
      "INVALID_IMAGE"
    );
  }

  if (file.size <= 0) {
    throw new AppError(
      "The image file cannot be empty.",
      400,
      "EMPTY_IMAGE"
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new AppError(
      "Each image must not exceed 5 MB.",
      413,
      "IMAGE_TOO_LARGE"
    );
  }

  const detectedType = await fileTypeFromBuffer(file.buffer);

  if (!detectedType || !ALLOWED_IMAGE_TYPES.has(detectedType.mime)) {
    throw new AppError(
      "Only JPEG, PNG, and WebP images are allowed.",
      400,
      "UNSUPPORTED_IMAGE_TYPE"
    );
  }

  // Ensure the detected file type matches the declared MIME type.
  if (file.mimetype !== detectedType.mime) {
    throw new AppError(
      "The image content does not match its declared file type.",
      400,
      "IMAGE_TYPE_MISMATCH"
    );
  }

  return {
    mimeType: detectedType.mime,
    extension: ALLOWED_IMAGE_TYPES.get(detectedType.mime),
    size: file.size,
  };
};