
import {
  EventSQL,
  EventResponse,
  gathoApiUrl,
  Status,
} from "../src/common-interfaces";
import { parseMatrixUsernamePretty, prettifiedDisplayName } from "../src/fullstack-utils";
import { copyToClipboard } from "../src/frontend-utils";
/** Generate 4 lists of the attendees, splt by response status */
export function GuestsByStatus({
  responses,
  status,
  event,
  areWeTheHost,
}: {
  responses: EventResponse[];
  status: Status;
  event: EventSQL;
  areWeTheHost: boolean
}) {
  return (
    <ul className={`guestsByStatus ${status}`}>
      {responses
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
            <li key={r.guest_id}>
              <span className="name">{name}</span>

              {areWeTheHost ? (
                <button
                  className={"copy-invite-button"}
                  onClick={() => copyToClipboard(inviteURL)}
                >
                  Copy invite link
                </button>
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