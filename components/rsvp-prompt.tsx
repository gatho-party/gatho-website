import {
  GuestSQL,
  RSVPPayload,
} from "../src/common-interfaces";
import { useRouter } from "next/router";
import { Status } from "../src/common-interfaces";
import { parseMatrixUsernamePretty, prettifiedDisplayName } from "../src/fullstack-utils";

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
  return (
    <div className="rsvp-prompt-component">
      <h3>
        {viewingGuest.displayname
          ? prettifiedDisplayName(viewingGuest.displayname)
          : parseMatrixUsernamePretty(viewingGuest.matrix_username as string)}
        , can you make it?
      </h3>
      <button
        onClick={async () => {
          await rsvp("going", viewingGuest.magic_code);
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