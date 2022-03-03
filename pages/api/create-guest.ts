import type { NextApiRequest, NextApiResponse } from 'next'
import { CreateGuestPayload } from '../../src/common-interfaces';
import { createNewEventGuest, createNewGuest, getEventsByHostEmail } from '../../src/db';
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

  const pool = createDatabasePool(req);

  const { displayname, matrix_username, eventId } = JSON.parse(req.body) as CreateGuestPayload;
  if (displayname === undefined && matrix_username === undefined) {
    res.status(500).json({ result: `We didn't receive a displayname OR matrix_username: ${displayname}, ${matrix_username}` })
    return;
  }
  if (eventId === undefined || eventId === null) {
    res.status(500).json({ result: `We didn't receive an eventId: ${eventId}` })
    return;
  }

  if(await isThisEmailHostOfThisEvent(pool, eventId, email) !== true) {
    res.status(500).json({ result: 'You are not the owner of the given event' })
    return;
  }

  const guestId = await createNewGuest(pool, { displayname, matrix_username });
  if (guestId === null) {
    res.status(500).json({ result: 'failed to add guest to DB' })
    return;
  }
  createNewEventGuest(pool, { guestId, eventId });

  res.status(200).json({ result: 'Successfully created user and invited' });
}
