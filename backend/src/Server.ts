import Express, { Request, Response } from 'express';
import CORS from 'cors';

import {
  RED_LINE_ROUTE_ID,
  MATTAPAN_LINE_ROUTE_ID,
  ORANGE_LINE_ROUTE_ID,
  GREEN_LINE_B_ROUTE_ID,
  GREEN_LINE_C_ROUTE_ID,
  GREEN_LINE_D_ROUTE_ID,
  GREEN_LINE_E_ROUTE_ID,
  BLUE_LINE_ROUTE_ID
} from '../../shared/Constants';
import { Path } from '../../shared/types/Api';
import { fetchPath, fetchHeadways } from './Utils';
import { Headway } from '../../shared/types/Performance';

const PORT: string = '5000';

const app = Express();
app.use(CORS());
app.use(Express.json());

async function handlePath(routeId: string, res: Response) {
  const path: Path | null = await fetchPath(routeId);
  if (path) {
    res.json({
      success: path,
    });
  } else {
    res.json({
      error: `Failed to fetch path ${routeId}.`
    });
  }
}

app.get('/api/red_line', async (_, res: Response) => {
  handlePath(RED_LINE_ROUTE_ID, res);
});

app.get('/api/mattapan_line', async (_, res: Response) => {
  handlePath(MATTAPAN_LINE_ROUTE_ID, res);
});

app.get('/api/orange_line', async (_, res: Response) => {
  handlePath(ORANGE_LINE_ROUTE_ID, res);
});

app.get('/api/green_line_b', async (_, res: Response) => {
  handlePath(GREEN_LINE_B_ROUTE_ID, res);
});

app.get('/api/green_line_c', async (_, res: Response) => {
  handlePath(GREEN_LINE_C_ROUTE_ID, res);
});

app.get('/api/green_line_d', async (_, res: Response) => {
  handlePath(GREEN_LINE_D_ROUTE_ID, res);
});

app.get('/api/green_line_e', async (_, res: Response) => {
  handlePath(GREEN_LINE_E_ROUTE_ID, res);
});

app.get('/api/blue_line', async (_, res: Response) => {
  handlePath(BLUE_LINE_ROUTE_ID, res);
});

app.get('/performance/headways', async (req: Request, res: Response) => {
  const stopId: string = req.query.stopId as string;
  const fromDatetime: number = parseInt(req.query.fromDatetime as string);
  const toDatetime: number = parseInt(req.query.toDatetime as string);
  const headways: Headway[] = await fetchHeadways(
    stopId,
    fromDatetime,
    toDatetime
  );
 
  res.json({
    success: headways,
  });
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

