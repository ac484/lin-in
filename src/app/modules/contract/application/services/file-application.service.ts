import { Injectable } from '@angular/core';
import { UploadFileCommand } from '../commands/upload-file.command';
import { FileDto } from '../dto/file.dto';
import { FileStorageService } from '../../infrastructure/external-services/file-storage.service';
import { FileUploadedEvent } from '../../domain/events/file-uploaded.event';

@Injectable({ providedIn: 'root' })
export class FileApplicationService {
  constructor(private storage: FileStorageService) {}

  async upload(command: UploadFileCommand): Promise<string> {
    const url = await this.storage.upload(command.contractCode, command.file);
    new FileUploadedEvent({
      contractCode: command.contractCode,
      contractId: command.contractId,
      url,
      fileName: command.file.name
    });
    return url;
  }
} 