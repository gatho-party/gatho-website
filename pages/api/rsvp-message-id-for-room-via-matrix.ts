import type { NextApiRequest, NextApiResponse } from 'next'
import { FetchRSVPMessageIdReq, FetchRSVPMessageIdRes } from '../../src/common-interfaces';
import { findRSVPMessageIdByRoom, } from '../../src/db';
import { getPoolWithMatrixRoomId, isMatrixBotKeyIncorrect, isNotPost } from '../../src/backend-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (isNotPost(req, res)) {
    return;
  }
  const payload = JSON.parse(req.body) as FetchRSVPMessageIdReq;
  if (isMatrixBotKeyIncorrect(payload, res)) {
    return;
  }
  const { matrix_room_address } = payload;

  const result = await getPoolWithMatrixRoomId(matrix_room_address);
  if (result === null) {
    const resObj: FetchRSVPMessageIdRes = {
      status: `success`,
      rsvp_message_id: null,
      event_exists_for_room: false
    }
    res.status(200).json(resObj)
    return;
  }
  const { pool } = result;
  const rsvpMessageId: string | null = await findRSVPMessageIdByRoom(pool, matrix_room_address);

  const resObj: FetchRSVPMessageIdRes = {
    status: `success`,
    rsvp_message_id: rsvpMessageId === '' ? null : rsvpMessageId,
    event_exists_for_room: true
  }
  res.status(200).json(resObj)
  return;
}
