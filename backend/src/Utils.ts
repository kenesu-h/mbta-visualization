import axios, { AxiosResponse, AxiosError } from 'axios';
import { decode } from '@googlemaps/polyline-codec';

import {
  MBTA_API,
  MBTA_PERFORMANCE_API,
  OPEN_PERFORMANCE_API_KEY,
} from '../../shared/Constants';
import {
  Path,
  Shape,
  Stop,
  Coordinate,
} from '../../shared/types/Api';
import {
  Headway,
} from '../../shared/types/Performance';

export async function fetchPath(
  routeId: string,
): Promise<Path | null> {
  let pathResponse: Path | null = null;

  await axios.get(`${MBTA_API}/routes`, {
    params: {
      fields: {
        route: 'id',
      },
      include: 'route_patterns',
      filter: {
        id: routeId,
      },
    },
  }).then(async (response: AxiosResponse) => {
    const body: any = response?.data;
    if (response && body) {
      // Routes have a 1:many relationship with RoutePatterns.
      // included contains the RoutePatterns for this Route
      const included: any[] = body?.included;

      // RoutePatterns have a 1:1 relationship with representative Trips.
      // Representative Trips are Trips that are arbitrarily selected so that
      // you can access the path and its stops more conveniently.
      if (included) {
        const tripIds: string[] = included.map((routePattern: any) => {
          return routePattern
            .relationships
            .representative_trip
            .data
            .id;
        });

        pathResponse = await fetchPathOfAllTrips(tripIds);
      }
    }
  }).catch((error: AxiosError) => {
    console.log(`An error occurred while fetching a path: ${error}`);
  });

  return pathResponse;
}

async function fetchPathOfAllTrips(
  tripIds: string[]
): Promise<Path | null> {
  let pathResponse: Path | null = null;

  await axios.get(`${MBTA_API}/trips`, {
    params: {
      include: 'shape,stops',
      filter: {
        id: tripIds.join(','),
      },
    },
  }).then((response: AxiosResponse) => {
    const body: any = response?.data;
    if (response && body) {
      const included: any[] = body?.included;
      if (included) {
        const shapes: Shape[] = [];
        const stops: Stop[] = [];

        included.forEach((entity: any) => {
          const attributes: any = entity?.attributes;
          switch (entity?.type) {
            case 'shape':
              const coordinates: Coordinate[] = decode(
                attributes.polyline
              ).map(
                (arr: number[]) => {
                  return {
                    latitude: arr[0],
                    longitude: arr[1],
                  };
                }
              );
              shapes.push({
                id: entity?.id,
                coordinates: coordinates
              });
              break;
            case 'stop':
              stops.push({
                id: entity?.id,
                coordinate: {
                  latitude: attributes?.latitude,
                  longitude: attributes?.longitude,
                },
                name: attributes?.name,
              });
              break;
          }
        });
        pathResponse = {
          shapes,
          stops,
        }
      }
    }
  }).catch((error: AxiosError) => {
    console.log(`An error occurred while fetching a path for all trips: ${error}`);
  });

  return pathResponse;
}

export async function fetchHeadways(
  stopId: string,
  fromDatetime: number,
  toDatetime: number
): Promise<Headway[]> {
  let headwayResponses: Headway[] = [];

  await axios.get(`${MBTA_PERFORMANCE_API}/headways`, {
    params: {
      api_key: OPEN_PERFORMANCE_API_KEY,
      format: 'json',
      stop: stopId,
      from_datetime: fromDatetime,
      to_datetime: toDatetime,
    },
  }).then((response: AxiosResponse) => {
    const body: any = response?.data;
    if (response && body) {
      const headways: any[] = body?.headways;
      headways.forEach((headway: any) => {
        headwayResponses.push({
          routeId: headway?.route_id,
          prevRouteId: headway?.prev_route_id,
          direction: headway?.direction,
          currentDeparture: headway?.current_dep_dt,
          previousDeparture: headway?.previous_dep_dt,
          headwayTime: headway?.headway_time_sec,
          benchmarkHeadwayTime: headway?.benchmark_headway_time_sec,
        });
      });
    }
  }).catch((error: AxiosError) => {
    console.log(`An error occurred while fetching headways: ${error}`);
  });

  return headwayResponses;
}
