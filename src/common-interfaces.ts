// export const gathoApiUrl = "http://localhost:3000";
export const gathoApiUrl = "https://gatho.party";

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

export interface EventGuestSQL {
  event: number,
  guest: number,
  status: Status
}
export interface GuestSQL {
  id: number,
  displayname?: string,
  matrix_username?: string,
  magic_code: string,
  phone_number: string
}

export interface EventResponse {
  guest_id: number,
  magic_code: string,
  displayname: string | null,
  matrix_username: string | null,
  phone_number: string
  status: Status
}

/////////

interface ViaMatrixPayload {
  /** Key sent from the Matrix bot to prove it's us! */
  secret_matrix_bot_key: string,
}

export interface RSVPPayload {
  status: Status,
  guest_magic_code: string,
}


export interface RSVPViaMatrixPayload extends ViaMatrixPayload {
  status: Status,
  matrix_username?: string;
  matrix_room_address: string;
  displayname?: string;
}

export interface CreateGuestPayload {
  eventId: number
  displayname?: string,
  matrix_username?: string,
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