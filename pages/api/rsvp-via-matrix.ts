import type { NextApiRequest, NextApiResponse } from 'next'
import { RSVPViaMatrixPayload } from '../../src/common-interfaces';
import { createNewGuest, findGuestByMatrixUsernameAndEvent, setStatusViaGuestAndEvent } from '../../src/db';
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

  // First we check if the guest exists FOR OUR EVENT
  let guestId: number | null = null;
  if (matrix_username !== undefined) {
    const guest = await findGuestByMatrixUsernameAndEvent(pool, matrix_username, eventId);
    console.log("Received guest:");
    console.log(JSON.stringify(guest));
    if (guest !== null) {
      guestId = guest.id
    }
  }

  let guestResponse;
  if (guestId === null) {
    guestResponse = await createNewGuest(pool, { event: eventId, matrix_username, displayname, status });

    if (guestResponse === null) {
      res.status(500).json({ result: `failed to update DB - unable to create new guest` })
      return;
    }
    guestId = guestResponse.guestId;
  }
  const success = await setStatusViaGuestAndEvent(pool, {guestId, eventId, status});
  if(success) {
    res.status(200).json({
      result:
        `Success: ${matrix_username} is '${status}' for ${matrix_room_address} (event ${eventId})`
    });
    return;
  } 
  res.status(500).json({ result: `Found guest but unable to set status` })
}
