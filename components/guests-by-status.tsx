import {
  EventSQL,
  gathoApiUrl,
  Status,
  RemoveGuestPayload,
  GuestSQL,
} from "../src/common-interfaces";
import {
  parseMatrixUsernamePretty,
  prettifiedDisplayName,
} from "../src/fullstack-utils";
import { copyToClipboard, getBySelector } from "../src/frontend-utils";
import { useRouter } from "next/router";

async function removeGuest({
  eventId,
  guestId,
}: {
  eventId: number;
  guestId: number;
}): Promise<boolean> {
  const data: RemoveGuestPayload = {
    eventId,
    guestId,
  };
  try {
    await fetch("/api/remove-guest-from-event", {
      body: JSON.stringify(data),
      method: "POST",
    });
    return true;
  } catch (e) {
    return false;
  }
}

/** Generate 4 lists of the attendees, splt by response status */
export function GuestsByStatus({
  guests,
  status,
  event,
  areWeTheHost,
}: {
  guests: GuestSQL[];
  status: Status;
  event: EventSQL;
  areWeTheHost: boolean;
}) {
  const router = useRouter();
  const refreshData = () => {
    router.replace(router.asPath);
  };
  return (
    <ul className={`guestsByStatus ${status}`}>
      {guests
        .filter((response) => response.status === status)
        .map((r) => {
          const inviteURL = `${gathoApiUrl}/event/${event.code}/${r.magic_code}`;
          const viaSignal: boolean = r.matrix_username
            ? r.matrix_username.includes("signal")
            : false;
          const showMatrixLink: boolean =
            viaSignal === false && r.matrix_username !== null;

          const name = r.displayname
            ? prettifiedDisplayName(r.displayname)
            : parseMatrixUsernamePretty(r.matrix_username as string);

          const li = (
            <li key={r.id}>
              <span className="name">{name}</span>

              {areWeTheHost ? (
                <span>
                  <button
                    className={"copy-invite-button"}
                    onClick={() => copyToClipboard(inviteURL)}
                  >
                    Copy invite link
                  </button>
                  <button
                    id={"remove-guest-button"}
                    onClick={async () => {
                      getBySelector("#remove-guest-button").innerText =
                        "Removing...";
                      await removeGuest({
                        guestId: r.id,
                        eventId: event.id,
                      });
                      refreshData();
                    }}
                  >
                    Remove guest
                  </button>
                </span>
              ) : null}

              {showMatrixLink ? (
                <p className={"dm-via-matrix"}>
                  DM on Matrix:{" "}
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://matrix.to/#/${r.matrix_username}`}
                  >
                    {r.matrix_username}
                  </a>
                </p>
              ) : null}

              {viaSignal ? (
                <p style={{ fontSize: "20px" }}>Via Signal to Matrix bridge</p>
              ) : null}
            </li>
          );
          return li;
        })}
    </ul>
  );
}
