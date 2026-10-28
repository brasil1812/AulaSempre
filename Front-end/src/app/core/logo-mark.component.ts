import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo-mark',
  standalone: true,
  template: `
<svg [attr.width]="size" [attr.height]="size" viewBox="0 0 64 64" fill="none" role="img" aria-label="AulaSempre">
  <circle cx="32" cy="32" r="24" [attr.stroke]="onDark ? '#FFFFFF' : bg" stroke-width="5"/>
  <path d="M32 32V15" [attr.stroke]="onDark ? '#FFFFFF' : bg" stroke-width="4" stroke-linecap="round"/>
  <g transform="rotate(120 32 32)">
    <path d="M29 32V18L32 12L35 18V32Z" [attr.fill]="onDark ? '#D7B687' : '#B97E24'"/>
    <path d="M30.6 15L32 12L33.4 15Z" [attr.fill]="onDark ? '#FFFFFF' : bg"/>
  </g>
  <circle cx="32" cy="32" r="3" [attr.fill]="onDark ? '#FFFFFF' : bg"/>
</svg>
  `,
  styles: [`:host { display: inline-flex; flex-shrink: 0; line-height: 0; }`],
})
export class LogoMarkComponent {
  @Input() size = 32;
  @Input() bg = '#1B2A4A';
  @Input() onDark = false;
}
