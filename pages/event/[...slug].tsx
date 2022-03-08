import { GetServerSideProps, GetServerSidePropsResult } from "next";
import styles from "../../styles/Home.module.css";
import {
  findGuestByMagicCode,
  getEventByCode,
  getGuestsByEvent,
  getHostUserByEmail,
} from "../../src/db";
import Head from "next/head";
import { EventSQL, GuestSQL } from "../../src/common-interfaces";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { statuses, statusMap } from "../../src/constants";
import { Status } from "../../src/common-interfaces";
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
import { GuestsByStatus } from "../../components/guests-by-status";
import { RSVPPrompt } from "../../components/rsvp-prompt";
import { AddNewGuest } from "../../components/add-new-guest";
import { useRouter } from "next/router";

interface EventProps extends GeoProps {
  event?: EventSQL | null;
  guests?: GuestSQL[] | null;
  viewingGuest?: GuestSQL | null;
  email?: string | null;
  weAreTheHost?: boolean;
  /** Unique code for the event in the URL (not a number ID) */
  eventCode?: string;
}

/** Returns number of guests invited with the given status */
function countGuestsByStatus(guests: GuestSQL[], status: Status): number {
  return guests.filter((guest) => guest.status === status).length;
}

function ResponsesView({
  event,
  guests,
  areWeTheHost,
}: {
  event: EventSQL;
  guests: GuestSQL[];
  areWeTheHost: boolean;
}) {
  return (
    <div>
      {statuses.map((status, index) => (
        <div key={index}>
          <h3>
            {statusMap[status]} ({countGuestsByStatus(guests, status)})
          </h3>
          <GuestsByStatus
            areWeTheHost={areWeTheHost}
            guests={guests}
            status={status}
            event={event}
          />
        </div>
      ))}
    </div>
  );
}

function Page({
  event,
  guests,
  viewingGuest,
  countryCode,
  inEurope,
  weAreTheHost,
  email,
  eventCode,
}: EventProps) {
  const router = useRouter();
  if (event === null || event === undefined) {
    return (
      <CountryContext.Provider value={{ countryCode, inEurope }}>
        <div className={`${styles.container} event`}>
          <DefaultHead />
          <Head>
            <title>Event not found - Gatho</title>
          </Head>

          <main className={styles.main}>
            <LoggedInDisplay authenticatedUser={email} />
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

  console.log({ viewingGuest, weAreTheHost });
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
          <LoggedInDisplay authenticatedUser={email} />
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
                Optional: Link with your Matrix group chat - see the the{" "}
                <Link href="/getting-started">getting started guide</Link>.
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

          {(viewingGuest === undefined || viewingGuest === null) &&
          weAreTheHost !== true ? (
            <div>
              <button
                onClick={() => {
                  router.replace(`/rsvp/${eventCode}`);
                }}
              >
                RSVP for this event!
              </button>
            </div>
          ) : null}

          {guests ? (
            <ResponsesView
              areWeTheHost={weAreTheHost === true}
              event={event}
              guests={guests}
            />
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
  const { req } = context;
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
  const weAreTheHost = email
    ? event.host === (await getHostUserByEmail(pool, email))
    : false;

  const guests = await getGuestsByEvent(pool, event.id);
  if (guests === null) {
    console.error("Why is responses null?!");
    return {
      props: {
        countryCode,
        inEurope,
      },
    };
  }

  // Viewing guest only defined when magic part of slug exists
  let viewingGuest =
    userMagicCode === null
      ? null
      : await findGuestByMagicCode(pool, userMagicCode);

  return {
    props: {
      event,
      guests,
      viewingGuest,
      email: email ? email : null,
      countryCode,
      inEurope,
      weAreTheHost,
      eventCode,
    },
  };
};

export default Page;
