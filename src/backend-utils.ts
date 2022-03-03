import { IncomingMessage } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";
import { Pool } from "pg";
import { getEventByRoomId, getEventsByHostEmail, newPool } from "./db";
import { secret_matrix_bot_key } from './constants';
import { parse } from 'accept-language-parser';
import { EventSQL } from "./common-interfaces";

/**
 * Retrives the 2 digit country code of the user using the Cloudflare
 * Geolocation header
 * https://support.cloudflare.com/hc/en-us/articles/200168236-Configuring-Cloudflare-IP-Geolocation#12345680
 * @param req HTTP Request with headers object
*/
export function getCountryCode(req: IncomingMessage): string {
  const country = req.headers['cf-ipcountry']
  if (country !== undefined && country.length === 2) {
    return country as string;
  }
  console.error(`Error: cf-ipcountry header is missing or unexpected: ${country}. This is expected if you're on local dev. Falling back to checking accept-language`);

  const languages = req.headers['accept-language']
  if (languages === undefined) {
    console.error(`Error: accept-language and cf-ifcountry is undefined. Defaulting to AU`);
    return 'AU';
  }
  try {
    const parsedLanguages = parse(languages);
    const chosenRegion = parsedLanguages[0].region;
    if (chosenRegion === undefined) {
      console.error(`Error: Unable to parse region from: ${languages}, defaulting to AU`);
      return 'AU';
    }
    return chosenRegion
  } catch (e) {
    console.error(`Error: Unable to parse region from: ${languages}, defaulting to AU`);
    return 'AU';
  }
}

/** From https://gist.github.com/henrik/1688572 */
const europeCountryList = [
  // EU 28:
  "AT", "Austria",
  "BE", "Belgium",
  "BG", "Bulgaria",
  "HR", "Croatia",
  "CY", "Cyprus",
  "CZ", "Czech Republic",
  "DK", "Denmark",
  "EE", "Estonia",
  "FI", "Finland",
  "FR", "France",
  "DE", "Germany",
  "GR", "Greece",
  "HU", "Hungary",
  "IE", "Ireland, Republic of (EIRE)",
  "IT", "Italy",
  "LV", "Latvia",
  "LT", "Lithuania",
  "LU", "Luxembourg",
  "MT", "Malta",
  "NL", "Netherlands",
  "PL", "Poland",
  "PT", "Portugal",
  "RO", "Romania",
  "SK", "Slovakia",
  "SI", "Slovenia",
  "ES", "Spain",
  "SE", "Sweden",
  "GB", "United Kingdom (Great Britain)",

  // Outermost Regions (OMR)
  // https://en.wikipedia.org/wiki/Special_member_state_territories_and_the_European_Union#Outermost_regions
  "GF", "French Guiana",
  "GP", "Guadeloupe",
  "MQ", "Martinique",
  "ME", "Montenegro",
  "YT", "Mayotte",
  "RE", "Réunion",
  "MF", "Saint Martin",
  // No Code, Azores
  // No Code, Canary Islands
  // No Code, Madeira

  // Special Cases: Part of EU
  // https://en.wikipedia.org/wiki/Special_member_state_territories_and_the_European_Union#Special_cases_in_Europe
  "GI", "Gibraltar",
  "AX", "Åland Islands",
  // No Code, Büsingen am Hochrhein
  // No Code, Campione d'Italia and Livigno
  // No Code, Ceuta and Melilla
  // No Code, UN Buffer Zone in Cyprus
  // No Code, Helgoland
  // No Code, Mount Athos

  // Overseas Countries and Territories (OCT)
  // https://en.wikipedia.org/wiki/Special_member_state_territories_and_the_European_Union#Overseas_countries_and_territories
  "PM", "Saint Pierre and Miquelon",
  "GL", "Greenland",
  "BL", "Saint Bartelemey",
  "SX", "Sint Maarten",
  "AW", "Aruba",
  "CW", "Curacao",
  "WF", "Wallis and Futuna",
  "PF", "French Polynesia",
  "NC", "New Caledonia",
  "TF", "French Southern Territories",
  "AI", "Anguilla",
  "BM", "Bermuda",
  "IO", "British Indian Ocean Territory",
  "VG", "Virgin Islands, British",
  "KY", "Cayman Islands",
  "FK", "Falkland Islands (Malvinas)",
  "MS", "Montserrat",
  "PN", "Pitcairn",
  "SH", "Saint Helena",
  "GS", "South Georgia and the South Sandwich Islands",
  "TC", "Turks and Caicos Islands",

  // Microstates
  // https://en.wikipedia.org/wiki/Microstates_and_the_European_Union
  "AD", "Andorra",
  "LI", "Liechtenstein",
  "MC", "Monaco",
  "SM", "San Marino",
  "VA", "Vatican City",

  // Other (Not sure how these fit in)
  "JE", "Jersey",
  "GG", "Guernsey",
  "GI", "Gibraltar"
]

export function isCountryInEurope(country: string): boolean {
  if (europeCountryList.includes(country)) {
    return true;
  }
  return false;
}

export function getConnectionString(country: string): string {
  if (isCountryInEurope(country)) {
    return process.env.DATABASE_URL_EU as string;
  }
  return process.env.DATABASE_URL_AU as string;
}

export function createDatabasePool(req: IncomingMessage): Pool {
  const countryCode = getCountryCode(req);
  const connectionString = getConnectionString(countryCode);
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
  const euDatabaseUrl = process.env.DATABASE_URL_EU as string;

  const auPool = newPool(auDatabaseUrl);
  console.log(`Trying to find room ${roomId} in AU...`);
  let maybeExistingEventInAU = await getEventByRoomId(auPool, roomId);

  let euPool: Pool | undefined;
  if (maybeExistingEventInAU === null) {
    console.log(`Didn't find it. Trying to find room ${roomId} in EU...`);
    console.log({ euDatabaseUrl });
    auPool.end();
    euPool = newPool(euDatabaseUrl);
    let maybeExistingEventInEU = await getEventByRoomId(euPool, roomId);
    if (maybeExistingEventInEU !== null) {
      // poolWithTheEvent = euPool;
      console.log(`Found room ${roomId} in EU.`);
      return { pool: euPool, event: maybeExistingEventInEU };
    } else {
      /** event doesn't exist in either DB */
      console.log(`Didn't find room ${roomId} in EU. Giving up.`);
      return null;
    }
  }
  console.log(`Found room ${roomId} in AU`);
  return { pool: auPool, event: maybeExistingEventInAU };
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