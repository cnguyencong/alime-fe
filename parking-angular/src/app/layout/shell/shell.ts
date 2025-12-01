import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import {
  LogoIcon,
  ChevronRightIcon,
  DashboardIcon,
  ListIcon,
  PlusIcon,
  XIcon,
} from '../../shared/icons';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LogoIcon,
    ChevronRightIcon,
    DashboardIcon,
    ListIcon,
    PlusIcon,
    XIcon,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  protected readonly isSidebarCollapsed = signal(false);

  protected toggleSidebar(): void {
    this.isSidebarCollapsed.update((value) => !value);
  }
}
