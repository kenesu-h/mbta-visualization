export interface Path {
  shapes: Shape[];
  stops: Stop[];
}

export interface Shape {
  id: string;
  coordinates: Coordinate[];
}

export interface Stop {
  id: string;
  coordinate: Coordinate; 
  name: string;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

