import { Injectable, inject } from '@angular/core';
import { ContractApplicationService } from '../../application/services/contract-application.service';
import { Observable } from 'rxjs';
import { Contract } from '../../application/models/contract.model';

@Injectable({ providedIn: 'root' })
export class ContractPresenterService {
  private app = inject(ContractApplicationService);
  getContractList(): Observable<Contract[]> {
    return this.app.getContractList();
  }
} 