import { Injectable } from '@angular/core';
import { CreateContractCommand } from '../commands/create-contract.command';
import { CreateContractDto } from '../dto/create-contract.dto';
import { ContractRepository } from '../../infrastructure/persistence/contract.repository';
import { ContractCreatedEvent } from '../../domain/events/contract-created.event';

@Injectable({ providedIn: 'root' })
export class CreateContractApplicationService {
  constructor(private repo: ContractRepository) {}

  async execute(command: CreateContractCommand): Promise<void> {
    const dto: CreateContractDto = { ...command };
    await this.repo.create(dto);
    // 觸發事件（可擴充）
    new ContractCreatedEvent(dto);
  }
} 