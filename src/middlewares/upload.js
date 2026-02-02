import multer from 'multer';
import multerS3 from 'multer-s3';
import s3 from '../config/spaces.js';
import path from 'path';

// Configuração para upload no Digital Ocean Spaces
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.DO_SPACES_BUCKET,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const folder = req.baseUrl.includes('users') ? 'avatars' : 'listings';
      cb(null, `${folder}/${uniqueSuffix}${ext}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif, webp)'));
    }
  }
});

export const uploadSingle = upload.single('image');
export const uploadMultiple = upload.array('images', 10);

// Middleware para tratar erros de upload
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Tamanho máximo: 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Número máximo de arquivos excedido. Máximo: 10 imagens'
      });
    }
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};
