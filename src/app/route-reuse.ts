import { ActivatedRouteSnapshot, RouteReuseStrategy } from '@angular/router';

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Keeps layout routes (the panel shell, its side nav and header) alive while
 * only the page inside them changes. A page itself is rebuilt whenever its
 * route params or query params change, so `/doctors/profile/2` -> `/3` still
 * loads fresh data.
 */
export class PhoenixRouteReuseStrategy implements RouteReuseStrategy {
  shouldDetach(): boolean { return false; }
  store(): void { }
  shouldAttach(): boolean { return false; }
  retrieve(): null { return null; }
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    if (future.routeConfig !== curr.routeConfig) return false;
    if (!future.routeConfig) return true; // root
    if (future.routeConfig.children?.length) return true; // layout shell
    return sameJson(future.params, curr.params) && sameJson(future.queryParams, curr.queryParams);
  }
}
