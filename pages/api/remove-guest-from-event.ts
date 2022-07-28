import type { NextApiRequest, NextApiResponse } from 'next'
import { RemoveGuestPayload } from '../../src/common-interfaces';
import { removeGuestFromEvent } from '../../src/db';
import { getSession } from 'next-auth/react';
import { createDatabasePool, isNotPost, isThisEmailHostOfThisEvent, validateSessionAndGetEmail } from '../../src/backend-utils';

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

  const pool = createDatabasePool();

  const { guestId, eventId } = JSON.parse(req.body) as RemoveGuestPayload;
  if (guestId === undefined || eventId === undefined) {
    res.status(500).json({ result: `We didn't receive guestId or eventId` })
    return;
  }
  if(await isThisEmailHostOfThisEvent(pool, eventId, email) !== true) {
    res.status(403).json({ result: 'You are not the owner of the given event' })
    return;
  }

  const success = await removeGuestFromEvent(pool, { guestId, eventId });
  if (success === false) {
    res.status(500).json({ result: 'failed to remove guest from event' })
    return;
  }
  res.status(200).json({ result: 'Successfully removed guest from event' });
}
