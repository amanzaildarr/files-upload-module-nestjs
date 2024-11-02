import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Media, MediaDocument } from './schema/media.schema';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'src/utils/response/transform-to-class';
import { MediaResponse } from './response/media.response';

@Injectable()
export class MediaService {
  private s3: S3Client;
  private bucketName: string;
  private s3Url: string;
  private basePath: string;

  constructor(
    @InjectModel(Media.name)
    private mediaModel: Model<Media>,
    private configService: ConfigService,
    private readonly i18n: I18nService,
  ) {
    // Initialize the S3 client with credentials and region from the config service
    this.s3 = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucketName = this.configService.get('AWS_BUCKET_NAME');
    this.s3Url = this.configService.get('AWS_S3URL');
    this.basePath = this.configService.get('NODE_ENV') + '/';
  }

  async uploadFiles(files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('Files are required');
    try {
      const mediaFiles = await Promise.all(files.map(async (file) => await this.uploadFile(file)));
      return Response.assign(MediaResponse, mediaFiles);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async remove(id: string) {
    const media = await this.mediaModel.findById(id);
    if (!media) throw new BadRequestException('File not exists');

    await this.awsFileDelete(media.key);
    await this.mediaModel.findByIdAndDelete(id);
    return 'File deleted';
  }

  /**
   * Uploads a file to S3 and saves its metadata to the database.
   * If mediaId is provided, it updates the existing media record.
   * @param file - The file to upload.
   * @param dir - The directory in S3 where the file will be stored.
   * @param mediaId - Optional media ID for updating an existing record.
   * @returns The saved MediaDocument.
   */
  async uploadFile(file: Express.Multer.File, dir: string = 'others', mediaId?: Types.ObjectId | string) {
    let media: MediaDocument;

    // If mediaId is provided, find and update the existing media record
    if (mediaId) {
      media = await this.mediaModel.findById(mediaId);
      await this.awsFileDelete(media.key);
    } else {
      media = new this.mediaModel();
    }

    // Upload the file to S3
    const awsRes = await this.awsUpload(file, dir);

    // Update the media document with S3 details
    media.key = awsRes.key;
    media.url = awsRes.url;
    media.type = file.mimetype;
    media.size = file.size;
    return media.save();
  }

  async uploadFileWithSession(file: Express.Multer.File, dir: string = 'others', session: ClientSession) {
    const media = new this.mediaModel();

    const awsRes = await this.awsUpload(file, dir);

    // Update the media document with S3 details
    media.key = awsRes.key;
    media.url = awsRes.url;
    media.type = file.mimetype;
    media.size = file.size;
    return media.save({ session });
  }

  /**
   * Uploads a file to AWS S3.
   * @param file - The file to upload.
   * @param dir - The directory in S3 where the file will be stored.
   * @returns An object containing the S3 key and URL of the uploaded file.
   * @throws BadRequestException if the upload fails.
   */
  private async awsUpload(file: Express.Multer.File, dir: string): Promise<{ key: string; url: string }> {
    try {
      const basePath = this.basePath + dir + '/';
      const key = `${basePath}${uuidv4()}-${file.originalname}`;
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
      };

      const command = new PutObjectCommand(params);
      await this.s3.send(command);
      return { key, url: this.s3Url + key };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  /**
   * Deletes a file from AWS S3.
   * @param key - The S3 key of the file to delete.
   * @returns A message confirming the deletion.
   */
  private async awsFileDelete(key: string): Promise<any> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
    };
    const command = new DeleteObjectCommand(params);
    await this.s3.send(command);
    return 'File deleted';
  }
}
