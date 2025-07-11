import { Injectable, inject } from '@angular/core';
import { ContractRepository } from '../../infrastructure/persistence/contract.repository';
import { Observable } from 'rxjs';
import { Contract } from '../models/contract.model';

@Injectable({ providedIn: 'root' })
export class ContractApplicationService {
  private repo = inject(ContractRepository);
  getContractList(): Observable<Contract[]> {
    return this.repo.getAll();
  }
} 