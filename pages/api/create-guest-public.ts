import type { NextApiRequest, NextApiResponse } from 'next'
import { CreateGuestPublicPayload, CreateGuestResponse, EventSQL } from '../../src/common-interfaces';
import { createNewGuest, getEventByCode } from '../../src/db';
import { createDatabasePool, isNotPost } from '../../src/backend-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (isNotPost(req, res)) {
    return;
  }

  const pool = createDatabasePool(req);

  const { displayname, status, eventCode } = JSON.parse(req.body) as CreateGuestPublicPayload;
  if (displayname === undefined) {
    const response: CreateGuestResponse = { success: false, error: `We didn't receive a displayname : ${displayname}` }
    res.status(500).json(response)
    return;
  }
  const maybeEvent = await getEventByCode(pool, eventCode);
  if (maybeEvent === null) {
    const response: CreateGuestResponse = { success: false, error: `Event code invalid` }
    res.status(403).json(response)
    return;
  }
  const event: EventSQL = maybeEvent;

  const dbRes = await createNewGuest(pool, { event: event.id, displayname, status });
  if (dbRes === null) {
    res.status(500).json({ result: 'failed to add guest to DB' })
    return;
  }
  const { magicCode } = dbRes;
  const response: CreateGuestResponse = { success: true, magicCode }
  res.status(200).json(response);
}
