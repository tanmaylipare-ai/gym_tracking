import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavTab {
  label: string;
  path: string;
  icon: string;
  activeIcon: string;
}

@Component({
    selector: 'app-bottom-nav',
    imports: [CommonModule, RouterLink, RouterLinkActive],
    template: `
    <nav class="fixed bottom-0 left-0 right-0 bg-gym-card border-t border-gym-border safe-bottom z-50">
      <div class="w-full max-w-5xl mx-auto flex items-stretch h-16">
        @for (tab of tabs; track tab.path) {
          <a
            [routerLink]="tab.path"
            routerLinkActive="!text-gym-accent"
            [routerLinkActiveOptions]="{exact: !['/workout', '/history'].includes(tab.path)
            }"
            class="flex-1 flex flex-col items-center justify-center gap-0.5 text-gym-muted transition-colors active:scale-95"
          >
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path [attr.d]="tab.icon" stroke="currentColor" stroke-width="1.8"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="text-[10px] font-medium">{{ tab.label }}</span>
          </a>
        }
      </div>
    </nav>
  `
})
export class BottomNavComponent {
  readonly tabs: NavTab[] = [
    {
      label: 'Workout',
      path: '/workout',
      icon: 'M3 6h3m15 0h-3M3 12h18M6 6v12M18 6v12M9 18h6',
      activeIcon: 'M3 6h3m15 0h-3M3 12h18M6 6v12M18 6v12M9 18h6'
    },
    {
      label: 'Routines',
      path: '/routines',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
      activeIcon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
    },
    {
      label: 'History',
      path: '/history',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      activeIcon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      label: 'Profile',
      path: '/profile',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      activeIcon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    }
  ];
}
