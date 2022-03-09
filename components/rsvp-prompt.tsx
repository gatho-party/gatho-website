import { GuestSQL, RSVPPayload } from "../src/common-interfaces";
import { useRouter } from "next/router";
import { Status } from "../src/common-interfaces";
import {
  parseMatrixUsernamePretty,
  prettifiedDisplayName,
} from "../src/fullstack-utils";
import { statusMap } from "../src/constants";
import confetti from 'canvas-confetti';

async function rsvp(status: Status, magic_code: string) {
  const data: RSVPPayload = {
    guest_magic_code: magic_code,
    status,
  };
  const result = await fetch("/api/rsvp", {
    body: JSON.stringify(data),
    method: "POST",
  });
  return result;
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
      <p>Change your status if you need to:</p>
      <button
        onClick={async () => {
          await rsvp("going", viewingGuest.magic_code);
          confetti();
          refreshData();
        }}
      >
        Going
      </button>
      <button
        onClick={async () => {
          await rsvp("maybe", viewingGuest.magic_code);
          refreshData();
        }}
      >
        Maybe
      </button>
      <button
        onClick={async () => {
          await rsvp("notgoing", viewingGuest.magic_code);
          refreshData();
        }}
      >
        Cant go
      </button>
    </div>
  );
}
