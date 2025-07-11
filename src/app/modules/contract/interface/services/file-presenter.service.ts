import { Injectable } from '@angular/core';
import { UploadFileCommand } from '../../application/commands/upload-file.command';
import { FileApplicationService } from '../../application/services/file-application.service';

@Injectable({ providedIn: 'root' })
export class FilePresenterService {
  constructor(private app: FileApplicationService) {}

  async uploadFile(command: UploadFileCommand): Promise<string> {
    return this.app.upload(command);
  }
} 