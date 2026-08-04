import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-privacy',
  imports: [RouterLink, FooterComponent],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.css',
})
export class PrivacyComponent {
 private router = inject(Router);

   backToLogin() {
    this.router.navigate(['/login']);
  }
 
}
