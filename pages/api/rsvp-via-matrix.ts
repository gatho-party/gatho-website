import type { NextApiRequest, NextApiResponse } from 'next'
import { RSVPViaMatrixPayload } from '../../src/common-interfaces';
import { createNewGuest, findGuestByMatrixUsername, setStatusViaGuestAndEvent } from '../../src/db';
import { getPoolWithMatrixRoomId, isMatrixBotKeyIncorrect, isNotPost } from '../../src/backend-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (isNotPost(req, res)) {
    return;
  }
  const payload = JSON.parse(req.body) as RSVPViaMatrixPayload;
  if (isMatrixBotKeyIncorrect(payload, res)) {
    return;
  }

  const { status, matrix_username, matrix_room_address, displayname } = payload;

  const poolAndEvent = await getPoolWithMatrixRoomId(matrix_room_address);
  if (poolAndEvent === null) {
    console.log(`Unable to find linked event in either region for ${matrix_room_address}`);
    res.status(500).json({ result: `Unable to find linked event in either region for ${matrix_room_address}` })
    return;
  }
  const { pool, event } = poolAndEvent;
  const eventId = event.id;

  // First we need to make sure the guest exists.
  let guestId: number | null = null;
  if (matrix_username !== undefined) {
    const guest = await findGuestByMatrixUsername(pool, matrix_username);
    console.log("Received guest:");
    console.log(JSON.stringify(guest));
    if (guest !== null) {
      guestId = guest.id
    }
  }

  if (guestId === null) {
    guestId = await createNewGuest(pool, { event: eventId, matrix_username, displayname });
  }
  if (guestId === null) {
    res.status(500).json({ result: `failed to update DB - unable to create new guest` })
    return;
  }

  const result = await setStatusViaGuestAndEvent(pool, { guestId, eventId, status });
  if (result === false) {
    res.status(500).json({ result: `failed to update DB - likely couldn't find guest by name` })
    return;
  }
  res.status(200).json({
    result:
      `Success: ${matrix_username} is '${status}' for ${matrix_room_address} (event ${eventId})`
  });
}
