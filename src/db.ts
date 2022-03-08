import { Pool } from "pg";
import { EventSQL, GuestSQL, EventDetails } from "./common-interfaces";
import { Status } from './common-interfaces';
import crypto from 'crypto';
import { parseMatrixUsernamePretty } from "./fullstack-utils";

/** Create a database pool connection */
export function newPool(connectionString: string) {
  return new Pool({
    connectionString,
    // Don't require ssl for dev (or anything but production)
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  });
}

export async function getEventByCode(
  client: Pool,
  code: string
): Promise<EventSQL | null> {
  const res = await client.query("SELECT * from events where code = $1", [
    code,
  ]);
  const possibleEvent = res.rows[0];
  if (possibleEvent === undefined) {
    return null;
  }
  return possibleEvent;
}

export async function getEventByRoomId(
  client: Pool,
  room_id: string
): Promise<EventSQL | null> {
  const res = await client.query("SELECT * from events where matrix_room_address = $1", [
    room_id,
  ]);
  const possibleEvent = res.rows[0];
  if (possibleEvent === undefined) {
    return null;
  }
  return possibleEvent;
}

export async function getEventsByHostEmail(
  client: Pool,
  email: string
): Promise<EventDetails[] | null> {
  const res = await client.query(
    `select e.* from events e join users u on e.host = u.id
      where u.email = $1;`, [
    email,
  ]);
  const possibleEvents = res.rows;
  if (possibleEvents === undefined) {
    return null;
  }
  return possibleEvents;
}

export async function getGuestsByEvent(
  pool: Pool,
  eventId: number
): Promise<GuestSQL[] | null> {
  const res = await pool.query(
    `
    select * from guests g where g.event = $1;`,
    [eventId]
  );
  const possibleResponses = res.rows;
  if (possibleResponses === undefined) {
    return null;
  }
  return possibleResponses;
}


export async function getHostUserByEmail(
  client: Pool,
  email: string): Promise<number | null> {
  let res = await client.query(
    "select u.id from users u where u.email = $1",
    [email]
  );
  if (res.rows.length === 0) {
    await client.query(
      "insert into users(email) values ($1);",
      [email]
    );
    res = await client.query(
      "select u.id from users u where u.email = $1",
      [email]
    );
    if (res.rows.length === 0) {
      console.error("No email found in users after it should have been inserted (getHostUserByEmail)")
      return null;
    }
  } else if (res.rows.length > 1) {
    console.error(">1 emails found when looking up host id");
    return null;
  }

  const possibleId: { id: string } = res.rows[0];
  if (possibleId === undefined) {
    console.error("email is undef when looking up host id");
    return null;
  }
  return parseInt(possibleId.id);
}

export async function findGuestByMagicCode(
  client: Pool,
  magicCode: string
): Promise<GuestSQL | null> {
  const res = await client.query(
    "select * from guests where guests.magic_code = $1",
    [magicCode]
  );
  const possibleGuest = res.rows[0];
  if (possibleGuest === undefined) {
    return null;
  }
  return possibleGuest;
}

/** Only use when looking up by a Matrix username! */
export async function findGuestByMatrixUsername(
  client: Pool,
  name: string
): Promise<GuestSQL | null> {
  const res = await client.query(
    "select * from guests where guests.matrix_username = $1",
    [name]
  );
  const possibleGuest = res.rows[0];
  if (possibleGuest === undefined) {
    return null;
  }
  return possibleGuest;
}

/**
 * Set the status of a guest
 * @returns True if success, false if unable to find guest
 */
export async function setStatusViaGuestAndEvent(
  client: Pool,
  { guestId, eventId, status }: {
    guestId: number,
    eventId: number, status: Status
  }
): Promise<boolean> {
  try {
    await client.query(
      "UPDATE guests SET status = $1 WHERE guest = $2 and event = $3;",
      [status, guestId, eventId]
    );
    return true;
  } catch (e) {
    console.error(`Unable to set status of guest ${guestId} for event ${eventId}`);
    return false;
  }
}

/** Set the status of a guest, using the magic code to look up the guest in the DB */
export async function setStatusViaMagicCode(
  client: Pool,
  magicCode: string,
  status: Status
): Promise<boolean> {

  const guest = await findGuestByMagicCode(client, magicCode);
  if (guest === null) {
    return false;
  }

  await client.query(
    "UPDATE guests SET status = $1 WHERE id = $2;",
    [status, guest.id]
  );

  return true;
}


/** Remove guest from event in the database. Returns true if operation succeeds */
export async function removeGuestFromEvent(
  client: Pool,
  { eventId, guestId }: {
    eventId: number,
    guestId: number,
  }
): Promise<boolean> {
  try {
    await client.query(
      "delete from guests where event = $1 and guest = $2;",
      [eventId, guestId]
    );
    return true;
  } catch (e) {
    console.error(`Error removing guest ${guestId} from event ${eventId}`);
    return false;
  }
}

/**
 * Creates a new guest. Handles creating the unique code and setting initial status.
 * @param client SQL client
 * @param param1 Fields
 * @returns Guest ID if success, null if failure
 */
export async function createNewGuest(
  client: Pool,
  { event, displayname, matrix_username }: {
    event: number,
    displayname?: string,
    matrix_username?: string ,
  }
): Promise<number | null> {

  // Insert guest
  const urlName = displayname ? displayname : (matrix_username
    ? parseMatrixUsernamePretty(matrix_username)
    : '')
  const regex = /[^A-Za-z0-9]/g;
  const plainAlphaName = urlName.replace(regex, "-");
  const magicCode = `${encodeURIComponent(plainAlphaName)}-${crypto.randomBytes(10).toString('hex')}`;

  const status: Status = 'invited';
  try {
    await client.query(
      "insert into guests(event, displayname, matrix_username, magic_code, status) values ($1,$2, $3, $4,$5);",
      [event, displayname, matrix_username, magicCode, status]
    );

    // get the primary key for the new guest
    const res = await client.query(
      "select g.id from guests g where magic_code = $1", [magicCode]
    );
    const guestId = res.rows[0].id;
    return guestId;
  } catch (e) {
    console.error(`Error creating guest displayname: ${displayname}, matrix: ${matrix_username}: ${e}`);
    return null;
  }
}
/** Returns code string if successful, null if not */
export async function createNewEvent(
  client: Pool,
  { name, description, time, place, email, matrix_room_address, matrix_rsvp_message }: {
    name: string,
    description: string,
    time: string,
    place: string,
    email: string,
    matrix_room_address: string,
    matrix_rsvp_message: string,
  }): Promise<string | null> {

  const host = await getHostUserByEmail(client, email);
  if (host === null) {
    return null;
  }

  const code = crypto.randomBytes(10).toString('hex');

  console.log({ host, code, name, description, time, place, matrix_room_address, matrix_rsvp_message });
  await client.query(
    `insert into events(host,code,name,description,time,place,matrix_room_address,matrix_rsvp_message)
    values ($1,$2,$3,$4,$5,$6,$7,$8);`,
    [host, code, name, description, time, place, matrix_room_address, matrix_rsvp_message]
  );

  return code;
}

export async function findRSVPMessageIdByRoom(
  client: Pool,
  matrixRoomAddress: string
): Promise<string | null> {
  const res = await client.query(
    "select e.matrix_rsvp_message from events e where e.matrix_room_address = $1",
    [matrixRoomAddress]
  );
  const possibleEventSubset = res.rows[0];
  if (possibleEventSubset === undefined) {
    return null;
  }
  return possibleEventSubset.matrix_rsvp_message;
}

export async function updateEventField(
  client: Pool,
  eventId: number,
  field: string,
  value: string
): Promise<boolean | null> {
  if (field !== 'name' && field !== 'place' && field !== 'time' && field !== 'description' &&
    field !== 'matrix_room_address' && field !== 'matrix_rsvp_message') {
    return null;
  }
  // TODO: Handle error
  await client.query(
    `UPDATE events SET ${field} = $1 WHERE id = $2`,
    [value, eventId]
  );
  return true;
}