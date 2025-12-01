import { Component, input } from '@angular/core';

@Component({
  selector: 'app-chevron-right-icon',
  standalone: true,
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      [class.rotated]="rotated()"
    >
      <path
        d="M9 18L15 12L9 6"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-block;
        width: 100%;
        height: 100%;
      }
      svg {
        width: 100%;
        height: 100%;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      svg.rotated {
        transform: rotate(180deg);
      }
    `,
  ],
})
export class ChevronRightIcon {
  readonly rotated = input<boolean>(false);
}
