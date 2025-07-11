import { Injectable } from '@angular/core';
import { CreateContractCommand } from '../../application/commands/create-contract.command';
import { CreateContractApplicationService } from '../../application/services/create-contract-application.service';

@Injectable({ providedIn: 'root' })
export class CreateContractPresenterService {
  constructor(private app: CreateContractApplicationService) {}

  async uploadPdf(file: File): Promise<string> {
    // TODO: 實際串接 Firebase Storage
    // 這裡僅模擬
    return Promise.resolve('https://fake.url/' + file.name);
  }

  async createContract(command: CreateContractCommand): Promise<void> {
    await this.app.execute(command);
  }
} 