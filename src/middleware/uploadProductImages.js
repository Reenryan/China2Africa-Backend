
import multer from "multer";
import AppError from "../utils/AppError.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
    fields: 110,
    parts: 120,
  },

  fileFilter: (req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return callback(
        new AppError(
          "Only JPEG, PNG, and WebP images are allowed.",
          400,
          "UNSUPPORTED_IMAGE_TYPE"
        )
      );
    }

    callback(null, true);
  },
});

export const uploadProductImages = (req, res, next) => {
  upload.array("images", MAX_FILES)(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return next(
          new AppError(
            "Each image must not exceed 5 MB.",
            413,
            "IMAGE_TOO_LARGE"
          )
        );
      }

      if (error.code === "LIMIT_FILE_COUNT") {
        return next(
          new AppError(
            "You can upload a maximum of 5 images per upload.",
            400,
            "TOO_MANY_IMAGES"
          )
        );
      }

      return next(
        new AppError(
          "The uploaded files could not be processed.",
          400,
          "INVALID_UPLOAD"
        )
      );
    }

    next(error);
  });
};