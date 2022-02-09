import type { NextApiRequest, NextApiResponse } from 'next'
import { RSVPPayload } from '../../src/common-interfaces';
import { setStatusViaMagicCode } from '../../src/db';
import { createDatabasePool, isNotPost} from '../../src/backend-utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (isNotPost(req,res)) {
    return;
  }
  const pool = createDatabasePool(req);
  const { guest_magic_code, status } = JSON.parse(req.body) as RSVPPayload;
  const result = await setStatusViaMagicCode(pool, guest_magic_code, status);
  if (result === false) {
    res.status(500).json({ result: 'failed to update DB' })
    return;
  }
  res.status(200).json({ result: 'Successfully set status' });
}
