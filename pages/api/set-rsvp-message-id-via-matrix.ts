import type { NextApiRequest, NextApiResponse } from 'next'
import { SetRSVPMessageReq } from '../../src/common-interfaces';
import { updateEventField } from '../../src/db'
import { getPoolWithMatrixRoomId, isMatrixBotKeyIncorrect, isNotPost } from '../../src/backend-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if(isNotPost(req,res)) {
    return;
  }
  const payload = JSON.parse(req.body) as SetRSVPMessageReq;
  if(isMatrixBotKeyIncorrect(payload, res)) {
    return;
  }

  const { room_id, rsvp_message_id } = payload;
  const poolAndEvent = await getPoolWithMatrixRoomId(room_id);
  if (poolAndEvent === null) {
    res.status(500).json({ status: 'failure', reason: `Unable to find event in any region linked to room ${room_id}` })
    return;
  }
  const {pool, event} = poolAndEvent;

  const eventId = event.id;
  await updateEventField(pool, eventId, 'matrix_rsvp_message', rsvp_message_id);

  res.status(200).json({
    status:
      `success`
  });
}
