Media Module

The MediaModule is a part of a NestJS application that provides media file handling services, including uploading and deleting files in AWS S3. This module is global and can be used across other modules in the application. It includes a REST API for uploading and removing media files.

Features

	•	File Upload to AWS S3: Supports uploading multiple files to specified directories within S3.
	•	File Deletion from AWS S3: Supports deleting files by their unique IDs.
	•	Database Integration: Saves file metadata in MongoDB to keep track of uploaded files.

Installation

	1.	Ensure you have the necessary AWS credentials and MongoDB connection details configured in your application.
	2.	Install required dependencies:

npm install @nestjs/mongoose mongoose @aws-sdk/client-s3 nestjs-i18n uuid



Configuration

Add the following environment variables to your .env file to configure AWS and other necessary settings:

AWS_REGION=<Your AWS Region>
AWS_ACCESS_KEY=<Your AWS Access Key>
AWS_SECRET_ACCESS_KEY=<Your AWS Secret Access Key>
AWS_BUCKET_NAME=<Your S3 Bucket Name>
AWS_S3URL=<Your S3 Bucket URL>
NODE_ENV=<Your Environment>  # e.g., 'dev', 'prod'

Usage

Importing the Module

To use the MediaModule in your application, import it into your root module or any other module where you need to use its services.

import { MediaModule } from './media/media.module';

@Module({
  imports: [MediaModule, /* other modules */],
})
export class AppModule {}

API Endpoints

The module provides two main endpoints:

1. Upload Files

	•	URL: POST /media/upload-files
	•	Description: Uploads multiple files to AWS S3 and saves metadata to MongoDB.
	•	Authorization: Requires an access token (Bearer authentication).
	•	Request:
	•	Content-Type: multipart/form-data
	•	Parameter: files (array of files to be uploaded)
	•	Response: Returns an array of MediaResponse objects containing metadata for each uploaded file.

2. Delete Media by ID

	•	URL: DELETE /media/:id
	•	Description: Deletes a file from AWS S3 and removes its metadata from MongoDB.
	•	Authorization: Requires an access token (Bearer authentication).
	•	Request:
	•	Parameter: id (the unique ID of the media to be deleted)
	•	Response: Returns a confirmation message upon successful deletion.

Code Structure

	•	MediaModule: Global module providing media services to other parts of the application.
	•	MediaService: Handles the logic for uploading and deleting files on AWS S3, and manages file metadata in MongoDB.
	•	uploadFiles(files: Express.Multer.File[]): Uploads multiple files.
	•	remove(id: string): Deletes a file by its ID.
	•	MediaController: Defines the REST API endpoints for media handling.
	•	Media Schema: MongoDB schema that stores metadata for uploaded files.
	•	Utilities:
	•	awsUpload: Private method for uploading a single file to S3.
	•	awsFileDelete: Private method for deleting a file from S3.

Error Handling

	•	BadRequestException: Thrown when required files are not provided or if there’s an issue with the S3 upload.
	•	UnauthorizedException: Thrown when an invalid or missing access token is provided.

Example

Upload Files Request (using CURL)

curl -X POST http://localhost:3000/media/upload-files \
  -H "Authorization: Bearer <access-token>" \
  -F "files=@path/to/file1.jpg" \
  -F "files=@path/to/file2.jpg"

Delete File by ID Request (using CURL)

curl -X DELETE http://localhost:3000/media/<media-id> \
  -H "Authorization: Bearer <access-token>"

Dependencies

	•	@nestjs/mongoose: For MongoDB integration.
	•	@aws-sdk/client-s3: For AWS S3 operations.
	•	nestjs-i18n: For internationalization.
	•	uuid: For generating unique file keys.

License

This project is licensed under the MIT License.
