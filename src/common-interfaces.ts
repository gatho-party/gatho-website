export const gathoApiUrl = process.env.NODE_ENV === 'production'
  ? "https://gatho.party"
  : "http://localhost:3000";

export type Status = 'going' | 'maybe' | 'notgoing' | 'invited';

export interface EventSQL {
  id: number,
  /** Host ID of the event */
  host: number,
  code: string,
  name: string,
  description: string
  /** ISO8601 time string */
  time: string;
  /** Address text */
  place: string;
  matrix_room_address: string;
  matrix_rsvp_message: string;
}

export interface GuestSQL {
  id: number,
  event: number,
  displayname: string | null,
  matrix_username: string | null,
  magic_code: string
  status: Status
}

interface ViaMatrixPayload {
  /** Key sent from the Matrix bot to prove it's us! */
  secret_matrix_bot_key: string,
}

/** When setting a guests status */
export interface RSVPPayload {
  status: Status,
  guest_magic_code: string,
}
/** Result from server when setting guest's status */
export interface RSVPResponsePayload {
  success: boolean;
  message?: string;
}

export interface RSVPViaMatrixPayload extends ViaMatrixPayload {
  status: Status,
  matrix_username?: string;
  matrix_room_address: string;
  displayname?: string;
}

export interface RemoveGuestPayload {
  guestId: number;
  eventId: number;
}

export interface CreateGuestPublicPayload {
  eventCode: string;
  displayname: string;
  status: Status;
}

export interface CreateGuestPayload {
  eventId: number
  displayname?: string,
  matrix_username?: string,
  status?: Status;
}

export interface CreateGuestResponse {
  success: boolean;
  error?: string;
  magicCode?: string;
}

export type EventField = "name" | "place" | "time" | "description" | "matrix_room_address" | "matrix_rsvp_message";
export interface UpdateEventFieldPayload {
  eventId: number,
  field: EventField,
  value: string
}

export interface EventDetails {
  id: number,
  description: string,
  matrix_room_address: string,
  matrix_rsvp_message: string,
  name: string,
  place: string,
  time: string,
  code: string,
}

export interface CreateEventPayload {
  name: string,
  description: string,
  place: string,
  time: string,
  matrix_room_address: string,
  matrix_rsvp_message: string
}

export interface FetchRSVPMessageIdReq extends ViaMatrixPayload {
  matrix_room_address: string
}
export interface FetchRSVPMessageIdRes {
  status: `success`,
  rsvp_message_id: string | null,
  event_exists_for_room: boolean
}

export interface SetRSVPMessageReq extends ViaMatrixPayload {
  room_id: string,
  rsvp_message_id: string,
}