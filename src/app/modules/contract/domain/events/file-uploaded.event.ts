import { FileDto } from '../../application/dto/file.dto';

export class FileUploadedEvent {
  constructor(public readonly file: FileDto) {}
} 