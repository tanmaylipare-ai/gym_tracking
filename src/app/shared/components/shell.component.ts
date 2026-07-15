import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavComponent } from './bottom-nav.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, BottomNavComponent],
  template: `
    <div class="flex flex-col h-screen bg-gym-bg overflow-hidden">
      <!-- Page content scrolls above the fixed nav -->
      <main class="flex-1 overflow-y-auto pb-16">
        <div class="w-full max-w-5xl mx-auto">
        <router-outlet />
        </div>
      </main>
      <app-bottom-nav />
    </div>
  `
})
export class ShellComponent {}
