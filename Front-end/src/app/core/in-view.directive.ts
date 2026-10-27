import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy } from '@angular/core';

@Directive({ selector: '[appInView]', standalone: true })
export class InViewDirective implements AfterViewInit, OnDestroy {
  private observer?: IntersectionObserver;

  constructor(
    private el: ElementRef<HTMLElement>,
    private zone: NgZone,
  ) {}

  ngAfterViewInit() {
    if (typeof IntersectionObserver !== 'function') {
      this.el.nativeElement.classList.add('in-view');
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting) return;
        this.el.nativeElement.classList.add('in-view');
        this.observer?.unobserve(this.el.nativeElement);
      }, { threshold: 0.2 });

      this.observer.observe(this.el.nativeElement);
    });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
