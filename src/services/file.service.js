// ua: Сервіс для роботи з файлами в Cloudflare та БД Prisma
// ua: відповідає за завантаження файлів, збереження мета та видалення файлів

const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/s3Client');
const prisma = require('../config/db');
const config = require('../config/index');
const AppError = require('../utils/appError');
const activityService = require('./activity.service'); // ua: підключаємо сервіс активності
// logger
const logger = require('../utils/logger');

class FileService {
  // ua: Завантаження файлу в хмару та запис метаданих у БД
  async uploadFile(file, documentId, userId) {
    // ua: перевірка, чи існує документ (підтягуємо workspaceId через категорію для логу)
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { category: { select: { workspaceId: true } } },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // ua: генерування унік імені файлу
    const fileKey = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;

    try {
      // ua: відправка файлу в Cloudflare R2
      await s3Client.send(
        new PutObjectCommand({
          Bucket: config.R2_BUCKET_NAME,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
          ContentDisposition: 'inline',
        }),
      );
    } catch (err) {
      // ua: лог помилку завантаження, аби розуміти причину збою R2
      logger.error(`[R2 Upload Error]: Failed to upload ${file.originalname}`, {
        error: err.message,
        userId,
        documentId,
      });
      throw new AppError('Failed to upload file to storage', 500);
    }

    // ua: формування URL та збереження запису в базі даних
    const fileUrl = `${process.env.R2_PUBLIC_URL}/${fileKey}`;

    const newFile = await prisma.file.create({
      data: {
        fileName: file.originalname,
        url: fileUrl,
        size: file.size,
        documentId: documentId,
        ownerId: userId,
      },
    });

    // ua: запис активності (UPLOAD_FILE)
    activityService.logActivity(
      document.category.workspaceId,
      userId,
      'UPLOAD_FILE',
      newFile.id,
      newFile.fileName,
    );

    return newFile;
  }

  // ua: Видалення файлу з хмари та з db
  async deleteFile(fileId) {
    // ua: пошук файлу у базі (підтягуємо ієрархію до воркспейсу для логу)
    const fileRecord = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        document: {
          include: { category: { select: { workspaceId: true } } },
        },
      },
    });

    if (!fileRecord) {
      throw new AppError('File not found', 404);
    }

    // ua: витягування Key (назву файлу в хмарі) з url
    const fileKey = fileRecord.url.split('/').pop();

    try {
      // ua: видалення фізичного обєкта з Cloudflare
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: config.R2_BUCKET_NAME,
          Key: fileKey,
        }),
      );
    } catch (err) {
      // ua: логуємо, якщо файл не видалився з хмари
      logger.error(
        `[R2 Delete Error]: Failed to delete ${fileKey} from cloud`,
        {
          error: err.message,
          fileId,
        },
      );
      // ua: throw кидаємо для безпеки
      throw new AppError('Failed to delete file from cloud storage', 500);
    }

    // ua: видалення запису з бази даних
    await prisma.file.delete({
      where: { id: fileId },
    });

    // ua: запис активності (DELETE_FILE)
    activityService.logActivity(
      fileRecord.document.category.workspaceId,
      fileRecord.ownerId,
      'DELETE_FILE',
      fileRecord.id,
      fileRecord.fileName,
    );

    return fileRecord;
  }
}

module.exports = new FileService();
