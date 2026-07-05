import multer from 'multer';
import path from 'path';
import fs from 'fs';

const lessonUploadDir = 'uploads/lessons';
const assignmentUploadDir = 'uploads/assignments';
const submissionUploadDir = 'uploads/submissions';
const profileUploadDir = 'uploads/profiles';

// Ensure directories exist
[lessonUploadDir, assignmentUploadDir, submissionUploadDir, profileUploadDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'assignment') cb(null, assignmentUploadDir);
    else if (file.fieldname === 'submission') cb(null, submissionUploadDir);
    else if (file.fieldname === 'profileImage') cb(null, profileUploadDir);
    else cb(null, lessonUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (file.fieldname === 'profileImage') {
    const allowedImageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (allowedImageTypes.includes(ext)) {
      return cb(null, true);
    } else {
      return cb(new Error('Only image files are allowed for profile pictures'));
    }
  }

  const allowedTypes = ['.mp4', '.pdf', '.mkv', '.avi', '.zip', '.docx', '.pptx', '.jpg', '.jpeg', '.png', '.gif'];
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

export const lessonUpload = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } });
export const assignmentUpload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });
export const submissionUpload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });
export const profileUpload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
