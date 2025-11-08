import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { Toast } from 'bootstrap';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  @ViewChild('successToast') toastEl!: ElementRef;
  private toast!: Toast;

  name = '';
  email = '';
  password = '';

  constructor(private auth: AuthService) {}

  ngAfterViewInit() {
    this.toast = new Toast(this.toastEl.nativeElement, { delay: 4000 });
  }

  async onSubmit() {
    if (!this.auth.isAllowedDomain(this.email)) {
      this.showSuccess('Dominio no permitido. Use @gmail.com o @outlook.com');
      return;
    }

    const res = await this.auth.register({ email: this.email, password: this.password, name: this.name });
    if (res.success) {
      this.showSuccess('Cuenta creada. Redirigiendo...');
      setTimeout(() => {
        window.location.href = '/seat-selection';
      }, 1500);
    } else {
      this.showSuccess(res.message || 'Error creando cuenta');
    }
  }

  showSuccess(msg: string) {
    const el = document.getElementById('successMessage');
    if (el) el.textContent = msg;
    this.toast.show();
  }
}