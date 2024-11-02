import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class MediaResponse {
  @ApiProperty({ type: String, example: '60c72b2f9b1e8e3a4c8b4567' })
  @Expose()
  id: string;

  @ApiProperty({ type: String, example: 'media/abc123' })
  @Expose()
  key: string;

  @ApiProperty({ type: String, example: 'https://example.com/media/abc123' })
  @Expose()
  url: string;

  @ApiProperty({ type: String, example: 'image/jpeg' })
  @Expose()
  type: string;

  @ApiProperty({ type: Number, example: 102400 })
  @Expose()
  @Type(() => Number)
  size: number;

  constructor(partial: Partial<MediaResponse>) {
    Object.assign(this, partial);
  }
}
