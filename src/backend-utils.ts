import { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";
import { Pool } from "pg";
import { getEventByRoomId, getEventsByHostEmail, newPool } from "./db";
import { secret_matrix_bot_key } from './constants';
import { EventSQL } from "./common-interfaces";

export function getConnectionString(): string {
  return process.env.DATABASE_URL as string;
}

export function createDatabasePool(): Pool {
  const connectionString = getConnectionString();
  const pool = newPool(connectionString);
  return pool;
}

export function isNotPost(req: NextApiRequest, res: NextApiResponse): boolean {
  if (req.method !== 'POST') {
    res.status(405).json({ result: 'Use post!' });
    return true;
  }
  return false;
}

export function validateSessionAndGetEmail(session: Session | null | undefined, res: NextApiResponse): string | null {
  if (
    session === undefined ||
    session === null ||
    session?.user?.email === undefined ||
    session.user.email === null) {
    res.status(403).json({ result: 'Not signed in' });
    return null;
  }
  return session.user.email;
}
export function isMatrixBotKeyIncorrect(payload: { secret_matrix_bot_key: string }, res: NextApiResponse): boolean {
  if (payload.secret_matrix_bot_key !== secret_matrix_bot_key) {
    res.status(403).json({ result: 'send correct secret_matrix_bot_key' })
    return true;
  }
  return false;
}

/**
 * Find the database which has an event linked to the specified Matrix room ID, and return the event
 * and a a Postgres * pool with the event. Return null if event in neither DB. Tries AU DB then EU
 * DB.
 * @param roomId Matrix room ID that is linked to a Gatho event
 * @returns Postgres Pool object and event object
 */
export async function getPoolWithMatrixRoomId(roomId: string): Promise<{ pool: Pool, event: EventSQL } | null> {
  const auDatabaseUrl = process.env.DATABASE_URL_AU as string;

  const auPool = newPool(auDatabaseUrl);
  console.log(`Trying to find room ${roomId} in AU...`);
  let maybeEvent = await getEventByRoomId(auPool, roomId);

  if(maybeEvent === null) {
    return null;
  }
  
  return { pool: auPool, event: maybeEvent };
}

/**
 * Check if user with the given email is the host of the event with the given event ID.
 * Returns null is no events found for host or an error occurs. Otherwise returns boolean
 */
export async function isThisEmailHostOfThisEvent(pool: Pool, eventId: number, email: string):
  Promise<boolean | null> {
  if (email === undefined) {
    return null;
  }
  const events = await getEventsByHostEmail(pool, email);
  if (events === null) {
    return null;
  }
  // If there isn't an event where the host ID is the same as the user, they don't own the given
  // event
  return events.find(event => event.id === eventId) !== undefined;
}