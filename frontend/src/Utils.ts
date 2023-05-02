import axios, { AxiosResponse, AxiosError } from 'axios'
import { Path, Coordinate } from '../../shared/types/Api';
import { Headway } from '../../shared/types/Performance';

export function normalizeCoordinate(
  coordinate: Coordinate,
  minLat: number, maxLat: number, minLong: number, maxLong: number
): Coordinate {
  return {
    latitude: (coordinate.latitude - minLat) / (maxLat - minLat),
    longitude: (coordinate.longitude - minLong) / (maxLong - minLong),
  };
}

export function scaleCoordinate(
  coordinate: Coordinate, factor: number
): Coordinate {
  return {
    latitude: coordinate.latitude * factor,
    longitude: coordinate.longitude * factor,
  }
}

export async function fetchRedLinePath(): Promise<Path | null> {
  let pathResponse: Path | null = null;

  await axios.get('http://localhost:5000/api/red_line')
    .then((response: AxiosResponse) => {
      const body: any = response?.data;
      if (response && body) {
        if (body.success) {
          pathResponse = body.success;
        } else {
          console.log(`Error received while fetching red line path: ${body.error}`);
        }
      }
    })
    .catch((error: AxiosError) => {
      console.log(`Error occurred while fetching red line path: ${error}`);
    });

  return pathResponse;
}

export async function fetchMattapanLinePath(): Promise<Path | null> {
  let pathResponse: Path | null = null;

  await axios.get('http://localhost:5000/api/mattapan_line')
  .then((response: AxiosResponse) => {
    const body: any = response?.data;
    if (response && body) {
      if (body.success) {
        pathResponse = body.success;
      } else {
        console.log(`Error received while fetching Mattapan line path: ${body.error}`);
      }
    }
  })
  .catch((error: AxiosError) => {
    console.log(`Error occurred while fetching Mattapan line path: ${error}`);
  });

  return pathResponse;
}

export async function fetchOrangeLinePath(): Promise<Path | null> {
  let pathResponse: Path | null = null;

  await axios.get('http://localhost:5000/api/orange_line')
  .then((response: AxiosResponse) => {
    const body: any = response?.data;
    if (response && body) {
      if (body.success) {
        pathResponse = body.success;
      } else {
        console.log(`Error received while fetching orange line path: ${body.error}`);
      }
    }
  })
  .catch((error: AxiosError) => {
    console.log(`Error occurred while fetching orange line path: ${error}`);
  });

  return pathResponse;
}

export async function fetchGreenLineBPath(): Promise<Path | null> {
  let pathResponse: Path | null = null;

  await axios.get('http://localhost:5000/api/green_line_b')
  .then((response: AxiosResponse) => {
    const body: any = response?.data;
    if (response && body) {
      if (body.success) {
        pathResponse = body.success;
      } else {
        console.log(`Error received while fetching green line B path: ${body.error}`);
      }
    }
  })
  .catch((error: AxiosError) => {
    console.log(`Error occurred while fetching green line B path: ${error}`);
  });

  return pathResponse;
}

export async function fetchGreenLineCPath(): Promise<Path | null> {
  let pathResponse: Path | null = null;

  await axios.get('http://localhost:5000/api/green_line_c')
  .then((response: AxiosResponse) => {
    const body: any = response?.data;
    if (response && body) {
      if (body.success) {
        pathResponse = body.success;
      } else {
        console.log(`Error received while fetching green line c path: ${body.error}`);
      }
    }
  })
  .catch((error: AxiosError) => {
    console.log(`Error occurred while fetching green line c path: ${error}`);
  });

  return pathResponse;
}

export async function fetchGreenLineDPath(): Promise<Path | null> {
  let pathResponse: Path | null = null;

  await axios.get('http://localhost:5000/api/green_line_d')
  .then((response: AxiosResponse) => {
    const body: any = response?.data;
    if (response && body) {
      if (body.success) {
        pathResponse = body.success;
      } else {
        console.log(`Error received while fetching green line D path: ${body.error}`);
      }
    }
  })
  .catch((error: AxiosError) => {
    console.log(`Error occurred while fetching green line D path: ${error}`);
  });

  return pathResponse;
}

export async function fetchGreenLineEPath(): Promise<Path | null> {
  let pathResponse: Path | null = null;

  await axios.get('http://localhost:5000/api/green_line_e')
  .then((response: AxiosResponse) => {
    const body: any = response?.data;
    if (response && body) {
      if (body.success) {
        pathResponse = body.success;
      } else {
        console.log(`Error received while fetching green line E path: ${body.error}`);
      }
    }
  })
  .catch((error: AxiosError) => {
    console.log(`Error occurred while fetching green line E path: ${error}`);
  });

  return pathResponse;
}

export async function fetchBlueLinePath(): Promise<Path | null> {
  let pathResponse: Path | null = null;

  await axios.get('http://localhost:5000/api/blue_line')
  .then((response: AxiosResponse) => {
    const body: any = response?.data;
    if (response && body) {
      if (body.success) {
        pathResponse = body.success;
      } else {
        console.log(`Error received while fetching blue line path: ${body.error}`);
      }
    }
  })
  .catch((error: AxiosError) => {
    console.log(`Error occurred while fetching blue line path: ${error}`);
  });

  return pathResponse;
}

export async function fetchHeadways(
  stopId: string,
  fromDatetime: number,
  toDatetime: number
): Promise<Headway[]> {
  let headwayResponses: Headway[] = [];

  await axios.get('http://localhost:5000/performance/headways', {
    params: {
      stopId,
      fromDatetime,
      toDatetime,
    },
  }).then((response: AxiosResponse) => {
    const body: any = response?.data;
    if (response && body) {
      if (body.success) {
        headwayResponses = body.success;
      } else {
        console.log(`Error received while fetching headways: ${body.error}`);
      }
    }
  }).catch((error: AxiosError) => {
    console.log(`Error occurred while fetching headways: ${error}`);
  });

  return headwayResponses;
} 
