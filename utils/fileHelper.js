const {
  S3Client,
  HeadObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand
} = require('@aws-sdk/client-s3');

const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read', 
    key: (req, file, cb) => {
      try {
        const ticketId = req.ticketId || uuidv4();
        req.ticketId = ticketId;

        const uniqueFilename = `${Date.now()}-${file.originalname}`;
        const filePath = `${ticketId}/${uniqueFilename}`;

        cb(null, filePath);
      } catch (err) {
        cb(err);
      }
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/mkv'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, MP4, and MKV files are allowed'), false);
    }
  },
});
const getImageUrl = async (ticketId, filename) => {
  const key = `${ticketId}/${filename}`;
  const headCommand = new HeadObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });

  await s3.send(headCommand); // Throws error if file not found

  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

const deleteS3Folder = async (ticketId) => {
  try {
    const listParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: `${ticketId}/`, // Delete all files under this prefix
    };

    const listCommand = new ListObjectsV2Command(listParams);
    const listResponse = await s3.send(listCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      console.log('No files found to delete in folder:', ticketId);
      return;
    }

    const objectsToDelete = listResponse.Contents.map(obj => ({ Key: obj.Key }));

    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Delete: {
        Objects: objectsToDelete,
        Quiet: true,
      },
    };

    const deleteCommand = new DeleteObjectsCommand(deleteParams);
    await s3.send(deleteCommand);

    console.log(`Successfully deleted S3 folder: ${ticketId}/`);
  } catch (error) {
    console.error('Error deleting S3 folder:', error);
    throw error;
  }
};
module.exports = {
  upload,
  getImageUrl,
  deleteS3Folder,
};
