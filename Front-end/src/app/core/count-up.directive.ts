import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

/**
 * Anima um número de 0 até o valor recebido (ex.: nos cards do painel).
 * Uso: <div [countUp]="12"></div>
 * Se o usuário prefere menos movimento, mostra o valor direto.
 */
@Directive({ selector: '[countUp]', standalone: true })
export class CountUpDirective implements OnChanges {
  @Input('countUp') value: number | string = 0;
  private frame = 0;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnChanges() {
    cancelAnimationFrame(this.frame);
    const text = String(this.value ?? '');
    const target = Number(String(this.value).replace(',', '.'));
    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!Number.isFinite(target) || reduce || target === 0) { this.el.nativeElement.textContent = text; return; }

    const decimals = text.includes('.') || text.includes(',') ? (text.split(/[.,]/)[1] ?? '').length : 0;
    const start = performance.now();
    const duration = 650;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      this.el.nativeElement.textContent = (target * eased).toFixed(decimals).replace('.', text.includes(',') ? ',' : '.');
      if (t < 1) this.frame = requestAnimationFrame(tick);
      else this.el.nativeElement.textContent = text;
    };
    this.frame = requestAnimationFrame(tick);
  }
}
