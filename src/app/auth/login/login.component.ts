import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { Toast } from 'bootstrap';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  @ViewChild('errorToast') toastEl!: ElementRef;
  private toast!: Toast;

  email = '';
  password = '';

  constructor(private auth: AuthService) {}

  ngAfterViewInit() {
    this.toast = new Toast(this.toastEl.nativeElement, { delay: 4000 });
  }

  async onSubmit() {
    const ok = await this.auth.login(this.email, this.password);
    if (ok) {
      window.location.href = '/seat-selection';
    } else {
      this.showError('Correo o contraseña incorrectos');
    }
  }

  showError(msg: string) {
    const el = document.getElementById('errorMessage');
    if (el) el.textContent = msg;
    this.toast.show();
  }
}