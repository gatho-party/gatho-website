import type { NextApiRequest, NextApiResponse } from 'next'
import { UpdateEventFieldPayload } from '../../src/common-interfaces';
import { getEventsByHostEmail, updateEventField } from '../../src/db';
import { getSession } from 'next-auth/react';
import { createDatabasePool, isNotPost, validateSessionAndGetEmail } from '../../src/backend-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (isNotPost(req, res)) {
    return;
  }
  const session = await getSession({ req });
  const email = validateSessionAndGetEmail(session, res);
  if ( email === null) {
    return;
  }

  const pool = createDatabasePool(req);
  const payload = JSON.parse(req.body) as UpdateEventFieldPayload;

  const { eventId, field, value } = payload;

  const events = await getEventsByHostEmail(pool, email);
  if (events === null) {
    res.status(403).json({ result: `No events found for host.` })
    return;
  }

  if (events.find(event => event.id === eventId) === undefined) {
    res.status(403).json({ result: `The signed in user isn't host of the given event` })
    return;
  }

  const result = await updateEventField(pool, eventId, field, value);

  if (result === false) {
    res.status(500).json({ result: 'failed to update DB' })
    return;
  }
  res.status(200).json({ result: 'Successfully updated event field' });
}
