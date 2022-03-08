import { CreateEventPayload, CreateGuestPublicPayload, CreateGuestResponse, gathoApiUrl, Status, UpdateEventFieldPayload } from "./common-interfaces";
import { CreateGuestPayload } from "../src/common-interfaces";

export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
export function getInputValue(selector: string): string {
  const input =
    document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement | null;
  if (input === null) {
    throw new Error(`Can't find input: ${selector}`);
  }
  return input.value;
}

export function getBySelector<T = any>(selector: string): T {
  const obj =
    document.querySelector(selector) as any;
  if (obj === null) {
    throw new Error(`Can't find: ${selector}`);
  }
  return obj;
}

export function parseMatrixEntityUrl(matrixRoomOrInviteUrl: string): string | null {
  const badRoomOrMessageLengthThreshold = 2;
  if (matrixRoomOrInviteUrl.includes("/")) {
    const segments = matrixRoomOrInviteUrl.split("/");
    const roomWithoutDomain = segments[segments.length - 1];

    if (roomWithoutDomain.includes("?")) {
      const withoutQueryParams = roomWithoutDomain.split("?")[0];
      if (withoutQueryParams.length < badRoomOrMessageLengthThreshold) {
        return null;
      }
      return withoutQueryParams;
    }
    if (roomWithoutDomain.length < badRoomOrMessageLengthThreshold) {
      return null;
    }
    return roomWithoutDomain;
  }
  return matrixRoomOrInviteUrl;
}

export function setEndOfContenteditable(contentEditableElement: any) {
  var range, selection;
  if (document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
  {
    range = document.createRange();//Create a range (a range is a like the selection but invisible)
    range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
    range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
    selection = window.getSelection();//get the selection object (allows you to change selection)
    if (selection === null) {
      return;
    }
    selection.removeAllRanges();//remove any selections already made
    selection.addRange(range);//make the range you have just created the visible selection
  }
}
/**
 * Return the code for the created event
 */
export async function createEventFromFrontend(details: CreateEventPayload): Promise<string | null> {
  const data: CreateEventPayload = { ...details };
  const result = await fetch("/api/create-event", {
    body: JSON.stringify(data),
    method: "POST",
  });
  if (result.status !== 200) {
    console.error(`Couldn't create event: ${JSON.stringify(result)}`);
  }
  const object = await result.json()
  return object.code;
}

export async function updateEventFieldFromFrontend({
  eventId,
  field,
  value,
}: UpdateEventFieldPayload) {
  const data: UpdateEventFieldPayload = {
    eventId,
    field,
    value,
  };
  const result = await fetch("/api/update-event-field", {
    body: JSON.stringify(data),
    method: "POST",
  });
  return result;
}

/** Send a POST request to the backend to create a new guest */
export async function addGuest({
  displayname,
  matrix_username,
  eventId,
  status
}: {
  displayname?: string;
  matrix_username?: string;
  eventId: number;
  status?: Status;
}): Promise<boolean> {
  if (displayname === undefined && matrix_username === undefined) {
    console.error("Both displayname and matrix_username is undefined!");
    return false;
  }
  const data: CreateGuestPayload = {
    displayname,
    matrix_username,
    eventId,
    status
  };
  try {
    await fetch("/api/create-guest", {
      body: JSON.stringify(data),
      method: "POST",
    });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Send a POST request to the backend to create a new guest. can be called by any client with
 * an event code.
 */
export async function addGuestPublic({
  displayname,
  eventCode,
  status
}: {
  displayname?: string;
  eventCode: string;
  status: Status;
}): Promise<null | string> {
  if (displayname === undefined) {
    console.error("displayname undefined!");
    return null;
  }
  const data: CreateGuestPublicPayload = {
    displayname,
    status,
    eventCode
  };
  try {
    const result: CreateGuestResponse = await (await fetch("/api/create-guest-public", {
      body: JSON.stringify(data),
      method: "POST",
    })).json();
    if(result.success === false) {
      console.error(result.error);
      return null;
    }
    return result.magicCode ? result.magicCode : null;
  } catch (e) {
    return null;
  }
}

export function generateGuestUrl({eventCode, guestMagicCode}:{eventCode: string, guestMagicCode: string}) {
  return `${gathoApiUrl}/event/${eventCode}/${guestMagicCode}`;
}