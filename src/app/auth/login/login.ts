import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel'; // <-- Import this

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CardModule,
    InputTextModule,
    ButtonModule,
    FloatLabelModule // <-- Add it here
  ],
  templateUrl: './login.html'
})
export class LoginComponent {

}