import { useState, useEffect } from 'react';
import {
  Center,
  Container,
  Flex,
  Group,
  Loader,
  Paper,
  Text,
  Stack,
  Select,
  Grid,
  Tabs,
  Table
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import { Path, Stop } from '../../shared/types/Api';
import { Headway } from '../../shared/types/Performance';
import { MbtaLine } from '../../shared/types/MbtaLine.d';
import MbtaMap from './MbtaMap';
import {
  fetchHeadways,
  fetchRedLinePath,
  fetchMattapanLinePath,
  fetchOrangeLinePath,
  fetchGreenLineBPath,
  fetchGreenLineCPath,
  fetchGreenLineDPath,
  fetchGreenLineEPath,
  fetchBlueLinePath
} from './Utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MbtaMapContent = () => {
  const [line, setLine] = useState<MbtaLine>(MbtaLine.Red);
  const [path, setPath] = useState<Path | null>(null);

  const fetchPaths: Map<MbtaLine, () => Promise<Path | null>> = new Map();
  fetchPaths.set(MbtaLine.Red, fetchRedLinePath);
  fetchPaths.set(MbtaLine.Mattapan, fetchMattapanLinePath);
  fetchPaths.set(MbtaLine.Orange, fetchOrangeLinePath);
  fetchPaths.set(MbtaLine.GreenB, fetchGreenLineBPath);
  fetchPaths.set(MbtaLine.GreenC, fetchGreenLineCPath);
  fetchPaths.set(MbtaLine.GreenD, fetchGreenLineDPath);
  fetchPaths.set(MbtaLine.GreenE, fetchGreenLineEPath);
  fetchPaths.set(MbtaLine.Blue, fetchBlueLinePath);

  const [hoveredStop, setHoveredStop] = useState<Stop | null>(null);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

  const [headways, setHeadways] = useState<{ [stopName: string]: Headway[] } | null>(null);
  const [date, setDate] = useState<Date | null>(getPrevMonday());

  // https://stackoverflow.com/questions/35088088/javascript-for-getting-the-previous-monday
  function getPrevMonday(): Date {
    const prevMonday: Date = new Date();
    prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() + 6) & 7);
    return prevMonday;
  }

  useEffect(() => {
    if (fetchPaths.has(line)) {
      const fetchPath = fetchPaths.get(line) as () => Promise<Path | null>;
      fetchPath().then(async (newPath: Path | null) => {
        setPath(newPath);
        if (newPath) {
          setHeadways(null);
          const newHeadways: { [stopName: string]: Headway[] } = {};
          await Promise.all(newPath.stops.map(async (stop: Stop) => {
            // A date's guaranteed to be set, but just satisfying TypeScript.
            if (date) {
              const datetime: number = date.getTime() / 1000;
              await fetchHeadways(
                stop.id,
                datetime,
                datetime + 604800
              ).then((headways: Headway[]) => {
                if (newHeadways[stop.name]) {
                  newHeadways[stop.name] = [...newHeadways[stop.name], ...headways];
                } else {
                  newHeadways[stop.name] = headways;
                }
                newHeadways[stop.name].sort((a: Headway, b: Headway) => {
                  return a.currentDeparture - b.currentDeparture;
                });
              });
            }
          }));
          setHeadways(newHeadways);
        }
      });
    }
  }, [line, date]);

  function dateToYyyyMmDd(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  function currentHeadwaysToHeadwayDates(): Date[] {
    if (headways) {
      if (hoveredStop) {
        return headways[hoveredStop.name].map((headway: Headway) => {
          return new Date(headway.currentDeparture * 1000);
        });
      } else if (selectedStop) {
        return headways[selectedStop.name].map((headway: Headway) => {
          return new Date(headway.currentDeparture * 1000);
        });
      }
    }
    return [];
  }

  const [latenesses, setLatenesses] = useState<number[]>([]);

  function currentHeadwaysToLatenesses(): number[] {
    if (headways) {
      if (hoveredStop) {
        return headways[hoveredStop.name].map((headway: Headway) => {
          return headway.headwayTime - headway.benchmarkHeadwayTime;
        });
      } else if (selectedStop) {
        return headways[selectedStop.name].map((headway: Headway) => {
          return headway.headwayTime - headway.benchmarkHeadwayTime;
        });
      }
    }
    return [];
  }

  useEffect(() => {
    setLatenesses(currentHeadwaysToLatenesses());
  }, [headways]);

  const chartOptions: any = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Chart.js Line Chart',
      },
      scales: {
        xAxes: [{
          type: "time"
        }],
      }
    },
    maintainAspectRatio: false
  };
  const chartData = {
    labels: currentHeadwaysToHeadwayDates().map((date: Date) => dateToYyyyMmDd(date)),
    datasets: [
      {
        label: "Lateness",
        data: currentHeadwaysToLatenesses(),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)"
      }
    ]
  }

  return (
    <>
      <Flex gap={"md"} direction={"row"}>
        <Flex
          gap={"md"}
          direction={"column"}
        >
          <Paper
            radius={"md"}
            p={"md"}
            w={600}
            h={600}
          >
            <Center h={"100%"}>
              {path ? (
                <MbtaMap
                  line={line}
                  path={path}
                  hoveredStop={hoveredStop}
                  setHoveredStop={setHoveredStop}
                  selectedStop={selectedStop}
                  setSelectedStop={setSelectedStop}
                  headways={headways}
                />
              ) : (
                <Loader />
              )}
            </Center>
          </Paper>
          <Group position={'center'}>
            <Select
              label="Train Line"
              value={line}
              onChange={(s) => {
                if (s) {
                  setLine(s as MbtaLine);
                  setPath(null);
                  setHeadways(null);
                  setHoveredStop(null);
                  setSelectedStop(null);
                }
              }}
              data={[
                { value: MbtaLine.Red, label: "Red" },
                { value: MbtaLine.Mattapan, label: "Mattapan" },
                { value: MbtaLine.Orange, label: "Orange" },
                { value: MbtaLine.GreenB, label: "Green B" },
                { value: MbtaLine.GreenC, label: "Green C" },
                { value: MbtaLine.GreenD, label: "Green D" },
                { value: MbtaLine.GreenE, label: "Green E" },
                { value: MbtaLine.Blue, label: "Blue" }
              ]}
            />
            <DatePickerInput
              label={"Week starting:"}
              value={date}
              onChange={setDate}
            />
          </Group>
        </Flex>
        <Flex
          gap={"md"}
          direction={"column"}
        >
          <h2>Overall</h2>
          {headways ? (
            <HeadwayOverview
              line={line}
              path={path}
              hoveredStop={hoveredStop}
              selectedStop={selectedStop}
              headways={headways}
              date={date}
            />
          ) : (
            <Loader />
          )}
          <Tabs defaultValue="overview">
            <Tabs.List>
              <Tabs.Tab value="overview">Overview</Tabs.Tab>
              <Tabs.Tab value="graphs">Graphs</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value={"overview"} pt={"xs"}>
              <Flex gap={"md"} direction={"column"}>
                { hoveredStop || selectedStop ? (
                  <>
                    <h2>
                      {
                        hoveredStop ?
                          hoveredStop.name
                          : selectedStop ?
                            selectedStop.name
                            : ''
                      }
                    </h2>
                  </>
                ) : (
                  <></>
                )}
                {headways ? (
                  <>
                    <HeadwayDetails
                      hoveredStop={hoveredStop}
                      selectedStop={selectedStop}
                      headways={headways}
                      date={date}
                    />
                  </>
                ) : (
                  <Loader />
                )}
              </Flex>
            </Tabs.Panel>

            <Tabs.Panel value={"graphs"} pt={"xs"}>
              { hoveredStop || selectedStop ? (
                <>
                  <h2>
                    {
                      hoveredStop ?
                        hoveredStop.name
                        : selectedStop ?
                          selectedStop.name
                          : ''
                    }
                  </h2>
                </>
              ) : (
                <></>
              )}
              {hoveredStop || selectedStop ? (
                <Container w={"1000px"} h={"450px"}>
                  <Line options={chartOptions} data={chartData} />
                </Container>
              ) : (
                <Text>Click or hover over a station on the map to view data.</Text>
              )}
            </Tabs.Panel>
          </Tabs>
        </Flex>
      </Flex>
    </>
  );
}

function getEarlyOrLate(lateness: number): string {
  if (lateness === 0) {
    return 'on time';
  } else if (lateness < 0) {
    return 'early';
  } else {
    return 'late';
  }
}

function formatSeconds(s: number): string {
  const hours: number = Math.floor(s / 3600);
  const minutes: number = Math.floor((s - (hours * 3600)) / 60);
  const seconds: number = Math.round(s - (hours * 3600) - (minutes * 60));

  return `${hours}h:${minutes}m:${seconds}s`
}

function formatLateness(lateness: number): string {
  return `${formatSeconds(Math.abs(lateness))} (${getEarlyOrLate(lateness)})`
}

interface HeadwayOverviewProps {
  line: MbtaLine;
  path: Path | null;
  hoveredStop: Stop | null;
  selectedStop: Stop | null;
  headways: { [stopId: string]: Headway[] } | null;
  date: Date | null;
}

const HeadwayOverview = (props: HeadwayOverviewProps): JSX.Element => {
  const [headways, setHeadways] = useState<Headway[]>([]);

  useEffect(() => {
    if (props.headways) {
      if (props.hoveredStop) {
        setHeadways(props.headways[props.hoveredStop.name]);
      } else if (props.selectedStop) {
        setHeadways(props.headways[props.selectedStop.name]);
      }
    }
  }, [props]);

  function lineToString(line: MbtaLine): string {
    switch (line) {
      case MbtaLine.Red:
        return 'red line';
      case MbtaLine.Mattapan:
        return 'Mattapan line';
      case MbtaLine.Orange:
        return 'orange line';
      case MbtaLine.GreenB:
        return 'green line (B)';
      case MbtaLine.GreenC:
        return 'green line (C)';
      case MbtaLine.GreenD:
        return 'green line (D)';
      case MbtaLine.GreenE:
        return 'green line (E)';
      case MbtaLine.Blue:
        return 'blue line';
      default:
        return 'unknown line';
    }
  }

  function mapLatenesses(headways: Headway[]): number[] {
    return headways.map((headway: Headway) => {
      return headway.headwayTime - headway.benchmarkHeadwayTime;
    });
  }

  function minOverallLateness(): number | null {
    if (props.headways) {
      let latenesses: number[] = [];
      for (let stopName in props.headways) {
        latenesses = [...latenesses, ...mapLatenesses(props.headways[stopName])];
      }
      return Math.min(...latenesses);
    } else {
      return null;
    }
  }

  // I hate this logic
  function whereMinOverallLateness(): Stop | null {
    if (props.headways) {
      let minOverall: number | null = minOverallLateness();
      let minStopName: string = '';
      if (minOverall) {
        for (let stopName in props.headways) {
          if (mapLatenesses(props.headways[stopName]).includes(minOverall)) {
            minStopName = stopName;
            break;
          }
        }
        if (minStopName) {
          if (props.path) {
            const stops: Stop[] = props.path.stops;
            for (let i: number = 0; i < stops.length; i++) {
              if (stops[i].name === minStopName) {
                return stops[i];
              }
            }
          }
        }
      }
    }
    return null;
  }

  function maxOverallLateness(): number | null {
    if (props.headways) {
      let latenesses: number[] = [];
      for (let stopName in props.headways) {
        latenesses = [...latenesses, ...mapLatenesses(props.headways[stopName])];
      }
      return Math.max(...latenesses);
    } else {
      return 0;
    }
  }

  function whereMaxOverallLateness(): Stop | null {
    if (props.headways) {
      let maxOverall: number | null = maxOverallLateness();
      let maxStopName: string = '';
      if (maxOverall) {
        for (let stopName in props.headways) {
          if (mapLatenesses(props.headways[stopName]).includes(maxOverall)) {
            maxStopName = stopName;
            break;
          }
        }
        if (maxStopName) {
          if (props.path) {
            const stops: Stop[] = props.path.stops;
            for (let i: number = 0; i < stops.length; i++) {
              if (stops[i].name === maxStopName) {
                return stops[i];
              }
            }
          }
        }
      }
    }
    return null;
  }

  function avgOverallLateness(): number | null {
    if (props.headways) {
      let latenesses: number[] = [];
      for (let stopName in props.headways) {
        latenesses = [...latenesses, ...mapLatenesses(props.headways[stopName])];
      }
      const totalLateness: number = latenesses.reduce((sum: number, lateness: number) => {
        return sum + lateness;
      }, 0);
      return totalLateness / latenesses.length;
    } else {
      return null;
    }
  }

  const minOverall: number | null = minOverallLateness();
  const whereMinOverall: Stop | null = whereMinOverallLateness();
  const whereMinOverallText: string = whereMinOverall ?
    whereMinOverall.name
    : 'an unknown station';

  const maxOverall: number | null = maxOverallLateness();
  const whereMaxOverall: Stop | null = whereMaxOverallLateness();
  const whereMaxOverallText: string = whereMaxOverall ?
    whereMaxOverall.name
    : 'an unknown station';

  const avgOverall: number | null = avgOverallLateness();

  return (
    <Flex direction={"column"}>
      <p>
        For the entire {lineToString(props.line)}, in the week
        starting {props.date?.toISOString()?.substring(0, 10)}:
      </p>
      <Stack>
        <Paper radius={'md'} p={'md'}>
          <Text>
            {
              minOverall ?
                minOverall === 0 ?
                  'The earliest train arrival was right on time at '
                    + `${whereMinOverallText}!`
                  : 'The earliest train arrival was '
                    + `${formatLateness(minOverall)} at ${whereMinOverallText}.`
                : 'No data found to calculate the earliest train with.'
            }
          </Text>
        </Paper>
        <Paper radius={'md'} p={'md'}>
          <Text>
            {
              maxOverall ?
                maxOverall === 0 ?
                  'The latest train arrival was right on time at '
                    + `${whereMaxOverallText}!`
                  : 'The latest train arrival was '
                    + `${formatLateness(maxOverall)} at ${whereMaxOverallText}.`
                : 'No data found to calculate the latest train with.' 
            }
          </Text>
        </Paper>
        <Paper radius={'md'} p={'md'}>
          <Text>
            {
              avgOverall ?
                avgOverall === 0 ?
                  'On average, trains arrived right on time!'
                  : `On average, trains arrived ${formatLateness(avgOverall)}.`
                : 'No data found to calculate average headway with.'
            }
          </Text>
        </Paper>
      </Stack>
    </Flex>
  )
}

interface HeadwayDetailsProps {
  hoveredStop: Stop | null;
  selectedStop: Stop | null;
  headways: { [stopId: string]: Headway[] } | null;
  date: Date | null;
}

const HeadwayDetails = (props: HeadwayDetailsProps) => {
  const [headways, setHeadways] = useState<Headway[]>([]);

  useEffect(() => {
    if (props.headways) {
      if (props.hoveredStop) {
        setHeadways(props.headways[props.hoveredStop.name]);
      } else if (props.selectedStop) {
        setHeadways(props.headways[props.selectedStop.name]);
      }
    }
  }, [props])

  function mapLatenesses(headways: Headway[]): number[] {
    return headways.map((headway: Headway) => {
      return headway.headwayTime - headway.benchmarkHeadwayTime;
    });
  }

  function minLateness(): number {
    const latenesses: number[] = mapLatenesses(headways);
    return Math.min(...latenesses);
  }

  function maxLateness(): number {
    const latenesses: number[] = mapLatenesses(headways);
    return Math.max(...latenesses)
  }

  function avgLateness(): number {
    const latenesses: number[] = mapLatenesses(headways);
    const totalLateness: number = latenesses.reduce((sum: number, lateness: number) => {
      return sum + lateness;
    }, 0);
    return totalLateness / latenesses.length;
  }

  return (
    <>
      { props.hoveredStop || props.selectedStop ?
        headways && headways.length ? (
          <Table>
            <tbody>
              <tr>
                <td>
                  <Text fw={700} span>Earliest</Text>
                </td>
                <td>
                  <Text span>{formatLateness(minLateness())}</Text>
                </td>
              </tr>
              <tr>
                <td>
                  <Text fw={700} span>Latest</Text>
                </td>
                <td>
                  <Text span>{formatLateness(maxLateness())}</Text>
                </td>
              </tr>
              <tr>
                <td>
                  <Text fw={700} span>Average</Text>
                </td>
                <td>
                  <Text span>{formatLateness(avgLateness())}</Text>
                </td>
              </tr>
              <tr>
                <td>
                  <Text fw={700} span># of Data Points</Text>
                </td>
                <td>
                  <Text span>{headways.length}</Text>
                </td>
              </tr>
            </tbody>
          </Table>
        ) : (
          <Text>No data found for this stop.</Text>
        )
      : (
        <Text>Click or hover over a station on the map to view data.</Text>
      )}
    </>
  )
}

export default MbtaMapContent;
