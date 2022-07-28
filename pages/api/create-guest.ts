import type { NextApiRequest, NextApiResponse } from 'next'
import { CreateGuestPayload, CreateGuestResponse } from '../../src/common-interfaces';
import { createNewGuest } from '../../src/db';
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

  const { displayname, matrix_username, eventId } = JSON.parse(req.body) as CreateGuestPayload;
  if (displayname === undefined && matrix_username === undefined) {
    const response: CreateGuestResponse = {success: false, error: `We didn't receive a displayname or matrix_username: ${displayname}, ${matrix_username}`}
    res.status(500).json(response)
    return;
  }
  if (eventId === undefined || eventId === null) {
    const response: CreateGuestResponse = {success: false, error: `We didn't receive an eventId: ${eventId}`}
    res.status(500).json(response)
    return;
  }

  if(await isThisEmailHostOfThisEvent(pool, eventId, email) !== true) {
    const response: CreateGuestResponse = {success: false, error: 'You are not the owner of the given event'}
    res.status(500).json(response)
    return;
  }

  const dbRes = await createNewGuest(pool, { event: eventId, displayname, matrix_username });
  if (dbRes === null) {
    res.status(500).json({ result: 'failed to add guest to DB' })
    return;
  }
  const {magicCode} = dbRes;
  const response: CreateGuestResponse = { success: true, magicCode }
  res.status(200).json(response);
}
