import { Component } from '@angular/core';
import { AppTopbar } from './components/app.topbar';
import { AppFooter } from "./components/app.footer";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [AppTopbar, AppFooter, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
