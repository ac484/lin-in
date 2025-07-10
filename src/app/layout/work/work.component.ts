import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { SplitterComponent } from '../../shared/components/splitter/splitter.component';

@Component({
  selector: 'app-work',
  standalone: true,
  imports: [MatCardModule, SplitterComponent],
  template: `
    <app-splitter [left]="200" [min]="80">
      <mat-card left>
        左區塊
      </mat-card>
      <mat-card right>
        右區塊
      </mat-card>
    </app-splitter>
  `
})
export class WorkComponent {}
