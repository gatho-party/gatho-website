import { GetServerSideProps, GetServerSidePropsResult } from "next";
import styles from "../../styles/Home.module.css";
import {
  eventResponses,
  findGuestByMagicCode,
  getEventByCode,
  getHostUserByEmail,
} from "../../src/db";
import Head from "next/head";
import {
  EventSQL,
  EventResponse,
  GuestSQL,
  RSVPPayload,
  CreateGuestPayload,
} from "../../src/common-interfaces";
import { useRouter } from "next/router";
import { getSession, useSession } from "next-auth/react";
import Link from "next/link";
import { statuses, statusMap } from "../../src/constants";
import {
  copyToClipboard,
  getBySelector,
  getInputValue,
} from "../../src/frontend-utils";
import {
  parseMatrixUsernamePretty,
  prettifiedDisplayName,
} from "../../src/fullstack-utils";
import { gathoApiUrl, Status } from "../../src/common-interfaces";
import { EditableEventHeading } from "../../components/editable-event-heading";
import { GathoLogo } from "../../components/gatho-logo";
import { LoggedInDisplay } from "../../components/logged-in-display";
import { Footer } from "../../components/footer";
import { DefaultHead } from "../../components/default-head";
import {
  createDatabasePool,
  getCountryCode,
  isCountryInEurope,
} from "../../src/backend-utils";
import { GeoProps } from "../../src/interfaces";
import { CountryContext } from "../../src/context";

async function addGuest({
  displayname,
  matrix_username,
  eventId,
}: {
  displayname?: string;
  matrix_username?: string;
  eventId: number;
}): Promise<boolean> {
  if (displayname === undefined && matrix_username === undefined) {
    console.error("Both displayname and matrix_username is undefined!");
    return false;
  }
  const data: CreateGuestPayload = {
    displayname,
    matrix_username,
    eventId,
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

interface EventProps extends GeoProps {
  event?: EventSQL | null;
  responses?: EventResponse[] | null;
  viewingGuest?: GuestSQL | null;
  email?: string | null;
  weAreTheHost?: boolean | undefined;
}
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

function RSVPPrompt({ viewingGuest }: { viewingGuest: GuestSQL }) {
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
/** Generate 4 lists of the attendees, splt by response status */
function GuestsByStatus({
  responses,
  status,
  event,
  weAreTheHost
}: {
  responses: EventResponse[];
  status: Status;
  event: EventSQL;
  weAreTheHost?: boolean;
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

              {weAreTheHost ? (
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

function countGuestsByStatus(
  responses: EventResponse[],
  status: Status
): number {
  return responses.filter((response) => response.status === status).length;
}

function ResponsesView({
  event,
  responses,
  weAreTheHost
}: {
  event: EventSQL;
  responses: EventResponse[];
  weAreTheHost?: boolean
}) {
  return (
    <div>
      {statuses.map((status, index) => (
        <div key={index}>
          <h3>
            {statusMap[status]} ({countGuestsByStatus(responses, status)})
          </h3>
          <GuestsByStatus responses={responses} status={status} event={event} weAreTheHost={weAreTheHost}/>
        </div>
      ))}
    </div>
  );
}

function AddNewGuest({ event }: { event: EventSQL }) {
  const router = useRouter();
  const refreshData = () => {
    router.replace(router.asPath);
  };
  return (
    <>
      <h3>Add a new guest (only visible to you)</h3>
      <input id="addGuestInput" placeholder="Guest name"></input>
      <button
        id="addGuestButton"
        onClick={async () => {
          const displayname = getInputValue("#addGuestInput");
          getBySelector("#addGuestButton").innerText = "Adding guest...";
          const successfullyAdded = await addGuest({
            displayname,
            matrix_username: undefined,
            eventId: event.id,
          });
          getBySelector("#addGuestButton").innerText = "Add guest";
          getBySelector("#addGuestInput").value = "";

          if (successfullyAdded) {
            alert(
              "Guest added! Now copy their invite link and send it to them."
            );
          } else {
            alert(
              "Failed to add guest - see links in footer for support. Sorry!"
            );
          }

          refreshData();
        }}
      >
        Add guest
      </button>
    </>
  );
}

function EventPage({
  event,
  responses,
  viewingGuest,
  countryCode,
  inEurope,
  weAreTheHost
}: EventProps) {
  const { data: session } = useSession();
  if (event === null || event === undefined) {
    return (
      <CountryContext.Provider value={{ countryCode, inEurope }}>
        <div className={`${styles.container} event`}>
          <DefaultHead />
          <Head>
            <title>Event not found - Gatho</title>
          </Head>

          <main className={styles.main}>
            <LoggedInDisplay authenticatedUser={session?.user?.email} />
            <Link href="/" passHref>
              <a>
                <GathoLogo className={"smallEventLogo"} />
              </a>
            </Link>
            <h1>404: event not found</h1>
            <p>
              Is your host in a different part of the world to where you are?
              Events created in Europe can only be accessed from there, likewise
              for outside the EU.
            </p>
            <p>
              If you are in the correct region and you are seeing this message
              in error, please contact Jake at{" "}
              <a href="mailto:jake@gatho.party">jake@gatho.party</a>.
            </p>
            <p>Your region is displayed at the bottom of the page</p>
          </main>
          <Footer />
        </div>
      </CountryContext.Provider>
    );
  }

  return (
    <CountryContext.Provider value={{ countryCode, inEurope }}>
      <div className={`${styles.container} event`}>
        <DefaultHead />
        <Head>
          <title>{event.name} - Gatho</title>
          <meta
            name="description"
            content={`See who's going, and the time and place of "${event.name}"`}
          />
        </Head>

        <main className={styles.main}>
          <LoggedInDisplay authenticatedUser={session?.user?.email} />
          <Link href="/" passHref>
            <a>
              <GathoLogo className={"smallEventLogo"} />
            </a>
          </Link>

          {weAreTheHost ? (
            <EditableEventHeading
              headingText={event.name}
              className={"event-name"}
              event={event}
              fieldName={"name"}
              placeholder={"Event name"}
            />
          ) : (
            <h2 className={"event-name editable-signed-in"}>{event.name}</h2>
          )}

          {weAreTheHost ? (
            <EditableEventHeading
              headingText={event.place}
              prefix={"📍 "}
              event={event}
              fieldName={"place"}
              placeholder={"Event location"}
            />
          ) : (
            <h2 className={"editable-signed-in"}>📍 {event.place}</h2>
          )}
          {weAreTheHost ? (
            <EditableEventHeading
              headingText={event.time}
              prefix={"🕦 "}
              event={event}
              fieldName={"time"}
              placeholder={"Event time"}
            />
          ) : (
            <h2>🕦 {event.time}</h2>
          )}

          {weAreTheHost ? (
            <div className="event-matrix-blurb">
              <p>
                Optional: Create a Matrix room and invite the Gatho Bot (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://matrix.to/#/@bot:matrix.gatho.party"
                >
                  @bot:matrix.gatho.party
                </a>
                ) - if a friend reacts to your invite message with a thumbs up
                emoji, they&apos;ll be marked as &quot;going&quot; on Gatho! See
                the <Link href="/getting-started">getting started guide</Link>{" "}
                for more info.
              </p>
            </div>
          ) : event.matrix_room_address.length !== 0 ? (
            <p className="join-group-chat">
              💬{" "}
              <a
                href={`https://matrix.to/#/${event.matrix_room_address}`}
                target="_blank"
                rel="noreferrer"
              >
                {" "}
                Join the event group chat
              </a>{" "}
              in a Matrix-compatible app! (eg. Element)
            </p>
          ) : null}

          {weAreTheHost ? (
            <div>
              <h2 className="event-description title">Event description:</h2>
              <EditableEventHeading
                className={"whitespace event-description"}
                headingText={event.description}
                event={event}
                fieldName={"description"}
                allowNewlines={true}
                placeholder={"Event description"}
              />
            </div>
          ) : (
            <h2 className={"event-description editable-signed-in"}>
              {event.description}
            </h2>
          )}

          {weAreTheHost ? <AddNewGuest event={event} /> : null}
          {viewingGuest !== null && viewingGuest !== undefined ? (
            <RSVPPrompt viewingGuest={viewingGuest} />
          ) : null}
          {responses ? (
            <ResponsesView event={event} responses={responses} weAreTheHost={weAreTheHost}/>
          ) : null}
        </main>
        <Footer />
      </div>
    </CountryContext.Provider>
  );
}

export const getServerSideProps: GetServerSideProps = async (
  context
): Promise<GetServerSidePropsResult<EventProps>> => {
  const session = await getSession(context);
  const { req} = context;
  const countryCode = getCountryCode(req);
  const inEurope = isCountryInEurope(countryCode);

  if (context.params === undefined || context.params.slug === undefined) {
    return {
      props: {
        countryCode,
        inEurope,
      },
    };
  }
  const slug = context.params.slug as string[];
  if (slug.length === 0) {
    return {
      props: {
        countryCode,
        inEurope,
      },
    };
  }
  const pool = createDatabasePool(context.req);

  const eventCode = slug[0]; // The first part of the url is the event code
  const userMagicCode = slug.length > 1 ? slug[1] : null; // The magic code for the user

  const event = await getEventByCode(pool, eventCode);
  if (event === null) {
    return {
      props: {
        countryCode,
        inEurope,
      },
    };
  }
  // Pass data to the page via props
  const email = session?.user?.email;
  const weAreTheHost = email ? event.host === (await getHostUserByEmail(pool, email)) : false;

  const responses = await eventResponses(pool, event.id);
  if (responses === null) {
    console.error("Why is responses null?!");
    return {
      props: {
        countryCode,
        inEurope,
      },
    };
  }

  // Viewing guest only defined when magic part of slug exists
  const viewingGuest =
    userMagicCode === null
      ? null
      : await findGuestByMagicCode(pool, userMagicCode);

  return {
    props: {
      event,
      responses,
      viewingGuest,
      email: email ? email : null,
      countryCode,
      inEurope,
      weAreTheHost
    },
  };
};

export default EventPage;
