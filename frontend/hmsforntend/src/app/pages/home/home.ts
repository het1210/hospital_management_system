import { Component } from '@angular/core';
import { Sidemenu } from '../../components/sidemenu/sidemenu';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from '../../components/toast/toast';

@Component({
  selector: 'app-home',
  imports: [Sidemenu, RouterOutlet, ToastComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
