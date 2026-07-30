import { getRouteInventory } from '../../src/lib/route-inventory.js';

export function routesByFamily() {
  const families = new Map();

  for (const route of getRouteInventory()) {
    if (!route.canonical) continue;
    const bucket = families.get(route.routeFamily) || [];
    bucket.push(route);
    families.set(route.routeFamily, bucket);
  }

  return families;
}

export function routesInFamily(routeFamily) {
  return routesByFamily().get(routeFamily) || [];
}

export function familyExemplars(routeFamilies) {
  return routeFamilies.map((routeFamily) => {
    const [route] = routesInFamily(routeFamily);
    if (!route) {
      throw new Error(`No canonical route found for family ${routeFamily}`);
    }
    return route;
  });
}
