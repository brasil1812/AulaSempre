import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

/**
 * Adiciona a classe "in-view" quando o elemento aparece na tela (uma única vez).
 * O CSS decide o que animar. Ex.: <li appInView> ... li.in-view { ... }
 */
@Directive({ selector: '[appInView]', standalone: true })
export class InViewDirective implements OnInit, OnDestroy {
  private io?: IntersectionObserver;
  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit() {
    const node = this.el.nativeElement;
    if (typeof IntersectionObserver === 'undefined') { node.classList.add('in-view'); return; }
    this.io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { node.classList.add('in-view'); this.io?.disconnect(); }
    }, { threshold: 0.35 });
    this.io.observe(node);
  }

  ngOnDestroy() { this.io?.disconnect(); }
}
