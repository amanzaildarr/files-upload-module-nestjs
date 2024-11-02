import { Controller, Delete, Param, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/utils/guards/auth.guard';
import { MediaService } from './media.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MediaResponse } from './response/media.response';

@Controller('media')
@ApiTags('Media')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Unauthorized.' })
@ApiForbiddenResponse({ description: 'Forbidden resource.' })
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload-files')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Upload files' })
  @ApiCreatedResponse({ type: [MediaResponse] })
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return this.mediaService.uploadFiles(files);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a media by id' })
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
