import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractPresenterService } from '../../services/contract-presenter.service';
import { Contract } from '../../../application/models/contract.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contract-list.page.html',
  styleUrls: ['./contract-list.page.scss']
})
export class ContractListPage implements OnInit {
  contracts$!: Observable<Contract[]>;
  private presenter = inject(ContractPresenterService);
  ngOnInit() {
    this.contracts$ = this.presenter.getContractList();
  }
}

