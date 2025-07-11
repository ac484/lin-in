import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FileStorageService {
  async upload(contractCode: string, file: File): Promise<string> {
    // TODO: 實際串接 Firebase Storage
    // 這裡僅模擬
    return Promise.resolve('https://fake.url/' + contractCode + '_' + file.name);
  }
} 