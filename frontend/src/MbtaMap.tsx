import { useState, useEffect } from 'react';
import { Stage, Layer, Line, Circle, Rect } from 'react-konva';

import {
  Path,
  Shape,
  Stop,
  Coordinate,
} from '../../shared/types/Api';
import { Headway } from '../../shared/types/Performance';
import { MbtaLine } from '../../shared/types/MbtaLine.d';
import {
  normalizeCoordinate,
  scaleCoordinate,
} from './Utils';

const CANVAS_SIZE: number = 400;
const PADDING: number = 50;

export interface MbtaMapProps {
  line: MbtaLine; 
  path: Path | null;

  hoveredStop: Stop | null;
  setHoveredStop: (stop: Stop | null) => void;
  selectedStop: Stop | null;
  setSelectedStop: (stop: Stop | null) => void;
  headways: { [stopId: string]: Headway[] } | null;
}

const MbtaMap = (props: MbtaMapProps) => {
  function normalizeShapes(shapes: Shape[]): Shape[] {
    let minLat: number = Number.POSITIVE_INFINITY;
    let maxLat: number = Number.NEGATIVE_INFINITY;
    let minLong: number = Number.POSITIVE_INFINITY;
    let maxLong: number = Number.NEGATIVE_INFINITY;

    shapes.forEach((shape: Shape) => {
      shape.coordinates.forEach((coordinate: Coordinate) => {
        minLat = Math.min(minLat, coordinate.latitude);
        maxLat = Math.max(maxLat, coordinate.latitude);
        minLong = Math.min(minLong, coordinate.longitude);
        maxLong = Math.max(maxLong, coordinate.longitude);
      });
    });

    return shapes.map((shape: Shape) => {
      return {
        id: shape.id,
        coordinates: shape.coordinates.map((c: Coordinate) => {
          return normalizeCoordinate(c, minLat, maxLat, minLong, maxLong);
        }),
      }
    });
  }

  function scaleShapes(shapes: Shape[], factor: number): Shape[] {
    return shapes.map((shape: Shape) => {
      return {
        id: shape.id,
        coordinates: shape.coordinates.map((c: Coordinate) => {
          return scaleCoordinate(c, factor);
        }),
      }
    });
  }

  function formatShapes(shapes: Shape[]): Shape[] {
    return scaleShapes(
      normalizeShapes(shapes),
      CANVAS_SIZE
    );
  }

  function lineColor(line: MbtaLine): string {
    switch (line) {
      case MbtaLine.Red:
        return 'red';
      case MbtaLine.Mattapan:
        return 'red';
      case MbtaLine.Orange:
        return 'orange';
      case MbtaLine.GreenB:
        return 'green';
      case MbtaLine.GreenC:
        return 'green';
      case MbtaLine.GreenD:
        return 'green';
      case MbtaLine.GreenE:
        return 'green';
      case MbtaLine.Blue:
        return 'blue';
      default:
        return 'gray';
    }
  }

  function renderShape(shape: Shape, line: MbtaLine, i: number): JSX.Element {
    const points: number[] = shape.coordinates.reduce(
      (acc: number[], coordinate: Coordinate) => {
        return [...acc, coordinate.longitude, coordinate.latitude];
      },
      []
    );

    return (
      <Line
        key={i}
        points={points}
        stroke={lineColor(line)}
        strokeWidth={4}
      />
    );
  }

  function renderShapes(shapes: Shape[], line: MbtaLine): JSX.Element[] {
    return shapes.map((shape: Shape, i: number) => {
      return renderShape(shape, line, i);
    });
  }

  function normalizeStops(stops: Stop[]): Stop[] {
    let minLat: number = Number.POSITIVE_INFINITY;
    let maxLat: number = Number.NEGATIVE_INFINITY;
    let minLong: number = Number.POSITIVE_INFINITY;
    let maxLong: number = Number.NEGATIVE_INFINITY;

    stops.forEach((stop: Stop) => {
      minLat = Math.min(minLat, stop.coordinate.latitude);
      maxLat = Math.max(maxLat, stop.coordinate.latitude);
      minLong = Math.min(minLong, stop.coordinate.longitude);
      maxLong = Math.max(maxLong, stop.coordinate.longitude);
    });

    return stops.map((stop: Stop) => {
      return {
        id: stop.id,
        coordinate: normalizeCoordinate(
          stop.coordinate, minLat, maxLat, minLong, maxLong
        ),
        name: stop.name,
      }
    });   
  }

  function scaleStops(stops: Stop[], factor: number): Stop[] {
    return stops.map((stop: Stop) => {
      return {
        id: stop.id,
        coordinate: scaleCoordinate(stop.coordinate, factor),
        name: stop.name,
      }
    });
  }

  function formatStops(stops: Stop[]): Stop[] {
    return scaleStops(
      normalizeStops(stops),
      CANVAS_SIZE
    );
  }

  function renderStop(stop: Stop, line: MbtaLine, i: number): JSX.Element {
    return (
      <Circle
        key={i}
        x={stop.coordinate.longitude}
        y={stop.coordinate.latitude}
        radius={10}
        fill={'white'}
        stroke={
          stopIsHovered(stop) || stopIsSelected(stop) ?
            'pink'
            : lineColor(line)
        }
        strokeWidth={4}
        onClick={() => props.setSelectedStop(stop)}
        onMouseEnter={() => props.setHoveredStop(stop)}
        onMouseLeave={() => props.setHoveredStop(null)}
      />
    );
  }

  function stopIsSelected(stop: Stop): boolean {
    return Boolean(props.selectedStop && props.selectedStop.id === stop.id);
  }

  function stopIsHovered(stop: Stop): boolean {
    return Boolean(props.hoveredStop && props.hoveredStop.id === stop.id);
  }

  function renderStops(stops: Stop[], line: MbtaLine): JSX.Element[] {
    return stops.map((stop: Stop, i: number) => {
      return renderStop(stop, line, i);
    });
  }

  return (
    <Stage 
      width={CANVAS_SIZE + PADDING}
      height={CANVAS_SIZE + PADDING}
    >
      {/* Flip vertically, because for some reason the polyline is flipped. */}
      <Layer
        scaleY={-1}
        offsetX={-(PADDING / 2)}
        offsetY={CANVAS_SIZE + (PADDING / 2)}
      >
        {/* This invisible rectangle only serves to reset the selected stop. */}
        <Rect
          width={CANVAS_SIZE + PADDING}
          height={CANVAS_SIZE + PADDING}
          onClick={() => props.setSelectedStop(null)}
        >
        </Rect>
        {
          props.path ?
            (
              <>
                { renderShapes(formatShapes(props.path.shapes), props.line) }
                { renderStops(formatStops(props.path.stops), props.line) }
              </>
            )
            : <></>
        }
      </Layer>
    </Stage>
  );
}

export default MbtaMap;
