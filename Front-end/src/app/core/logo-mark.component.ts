import { Component, Input } from '@angular/core';

/**
 * Símbolo do AulaSempre: uma folha de caderno pautada.
 * A margem dourada e as linhas contínuas lembram a sala de aula e a ideia de "sempre".
 * - bg: cor da folha (navy por padrão; verde na área do professor)
 * - onDark: versão invertida para fundos escuros
 */
@Component({
  selector: 'app-logo-mark',
  standalone: true,
  template: `
<svg [attr.width]="size" [attr.height]="size" viewBox="0 0 32 32" fill="none" role="img" aria-label="AulaSempre">
  <rect width="32" height="32" rx="4" [attr.fill]="onDark ? '#FFFFFF' : bg"/>
  <rect x="8.5" y="0" width="2" height="32" fill="#B97E24"/>
  <g [attr.stroke]="onDark ? '#1B2A4A' : '#FFFFFF'" stroke-width="2" stroke-linecap="round">
    <line x1="15" y1="10" x2="27" y2="10"/>
    <line x1="15" y1="16" x2="27" y2="16"/>
    <line x1="15" y1="22" x2="22" y2="22"/>
  </g>
</svg>
  `,
  styles: [`:host { display: inline-flex; flex-shrink: 0; line-height: 0; }`],
})
export class LogoMarkComponent {
  @Input() size = 32;
  @Input() bg = '#1B2A4A';
  @Input() onDark = false;
}
