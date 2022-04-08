import {
  GuestSQL,
  RSVPPayload,
  RSVPResponsePayload,
} from "../src/common-interfaces";
import { useRouter } from "next/router";
import { Status } from "../src/common-interfaces";
import {
  parseMatrixUsernamePretty,
  prettifiedDisplayName,
} from "../src/fullstack-utils";
import { statusMap } from "../src/constants";
import confetti from "canvas-confetti";

/**
 * Send RSVP to the backend for a given users
 * @param status Status of the guest
 * @param magic_code Secret code for the user to identify them
 * @returns Success or failure object
 */
export async function sendRSVPStatus(
  status: Status,
  magic_code: string
): Promise<RSVPResponsePayload> {
  const data: RSVPPayload = {
    guest_magic_code: magic_code,
    status,
  };
  const result = await fetch("/api/rsvp", {
    body: JSON.stringify(data),
    method: "POST",
  });
  return result.json();
}
export function RSVPPrompt({ viewingGuest }: { viewingGuest: GuestSQL }) {
  const router = useRouter();
  const refreshData = () => {
    router.replace(router.asPath);
  };
  const name = viewingGuest.displayname
    ? prettifiedDisplayName(viewingGuest.displayname)
    : parseMatrixUsernamePretty(viewingGuest.matrix_username as string);

  const prettyStatus = statusMap[viewingGuest.status];
  const callToAction =
    viewingGuest.status === "invited"
      ? `${name}, can you make it?`
      : viewingGuest.status === "going"
      ? `${name}, your status is "${prettyStatus}" 🎉`
      : `${name}, your status is "${prettyStatus}"`;

  return (
    <div className="rsvp-prompt-component">
      <h3>{callToAction}</h3>
      {viewingGuest.status !== "invited" ? (
        <p>Change your status if you need to:</p>
      ) : null}
      <button
        onClick={async () => {
          await sendRSVPStatus("going", viewingGuest.magic_code);
          confetti();
          refreshData();
        }}
      >
        Going
      </button>
      <button
        onClick={async () => {
          await sendRSVPStatus("maybe", viewingGuest.magic_code);
          refreshData();
        }}
      >
        Maybe
      </button>
      <button
        onClick={async () => {
          await sendRSVPStatus("notgoing", viewingGuest.magic_code);
          refreshData();
        }}
      >
        Can&apos;t go
      </button>
    </div>
  );
}
