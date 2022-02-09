import type { NextApiRequest, NextApiResponse } from 'next'
import { CreateEventPayload } from '../../src/common-interfaces';
import { createNewEvent } from '../../src/db';
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
  if (email === null) {
    return;
  }
  const payload = JSON.parse(req.body) as CreateEventPayload;
  const newEventPayload = {
    email,
    ...payload,
  }

  const pool = createDatabasePool(req);
  const result = await createNewEvent(pool, newEventPayload);

  if (result === null) {
    res.status(500).json({ result: 'failed to update DB' })
    return;
  }
  res.status(200).json({ result: 'Successfully created user and invited', code: result });
} 
