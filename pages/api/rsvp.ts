import type { NextApiRequest, NextApiResponse } from 'next'
import { RSVPPayload, RSVPResponsePayload } from '../../src/common-interfaces';
import { setStatusViaMagicCode } from '../../src/db';
import { createDatabasePool, isNotPost } from '../../src/backend-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Called RSVP");
  if (isNotPost(req, res)) {
    return;
  }
  const pool = createDatabasePool(req);
  const { guest_magic_code, status } = JSON.parse(req.body) as RSVPPayload;
  let result;
  try {
    result = await setStatusViaMagicCode(pool, guest_magic_code, status);
  } catch (e) {
    const response: RSVPResponsePayload = {
      success: false,
      message: `Failed to set status: ${e}`
    }
    res.status(500).json(response)
    return;
  }
  if (result === false) {
    const response: RSVPResponsePayload = {
      success: false,
      message: `Failed to update DB`
    }
    res.status(500).json(response)
    return;
  }
    const response: RSVPResponsePayload = {
      success: true,
    }
  res.status(200).json(response)
}
