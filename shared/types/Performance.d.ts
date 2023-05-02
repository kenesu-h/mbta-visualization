export interface Headway {
  routeId: string;
  prevRouteId: string;
  direction: number;
  currentDeparture: number;
  previousDeparture: number;
  headwayTime: number;
  benchmarkHeadwayTime: number;
}
