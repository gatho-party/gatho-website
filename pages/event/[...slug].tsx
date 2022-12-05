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
import { EditableTextfield } from "../../components/editable-event-heading";
import { GathoLogo } from "../../components/gatho-logo";
import { LoggedInDisplay } from "../../components/logged-in-display";
import { Footer } from "../../components/footer";
import { DefaultHead } from "../../components/default-head";
import { createDatabasePool } from "../../src/backend-utils";
import { GeoProps } from "../../src/interfaces";
import { GuestsByStatus } from "../../components/guests-by-status";
import { RSVPPrompt } from "../../components/rsvp-prompt";
import { AddNewGuest } from "../../components/add-new-guest";
import { useRouter } from "next/router";
import { maybeStoreUserMagicCode } from "../../src/frontend-utils";
import Linkify from "linkify-react";

interface EventProps extends GeoProps {
  event?: EventSQL | null;
  guests?: GuestSQL[] | null;
  viewingGuest?: GuestSQL | null;
  email?: string | null;
  weAreTheHost?: boolean;
  /** Unique code for the event in the URL (not a number ID) */
  longEventCode?: string;
  /** The long code identifying the user in the URL */
  userMagicCode?: string | null;
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
  weAreTheHost,
  email,
  longEventCode,
  userMagicCode,
}: EventProps) {
  const router = useRouter();
  if (event === null || event === undefined) {
    return (
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
            If you are in the correct region and you are seeing this message in
            error, please contact Jake at{" "}
            <a href="mailto:jake@jakecoppinger.com">jake@jakecoppinger.com</a>.
          </p>
          <p>Your region is displayed at the bottom of the page</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (longEventCode) {
    maybeStoreUserMagicCode({
      longEventCode,
      userMagicCodeURL: userMagicCode,
      weAreTheHost,
      router,
    });
  }

  return (
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
          <EditableTextfield
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
          <EditableTextfield
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
          <EditableTextfield
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
          <div>
            <h2 className="event-description title">Event description:</h2>
            <EditableTextfield
              className={"whitespace event-description"}
              headingText={event.description}
              event={event}
              fieldName={"description"}
              allowNewlines={true}
              placeholder={"Event description"}
              linkify={true}
            />

          </div>
        ) : (
          <h2 className={"event-description editable-signed-in"}>
            <Linkify
              as="p"
              options={{
                target: "_blank", // Open all links in new tab
              }}
            >
              {event.description}
            </Linkify>
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
                router.replace(`/rsvp/${longEventCode}`);
              }}
            >
              RSVP for this event!
            </button>
          </div>
        ) : null}

        {weAreTheHost ? (
          <div className="event-matrix-blurb">
            <br></br>
            <p>
              Optional: Link with your Matrix group chat - see the the{" "}
              <Link href="/getting-started">getting started guide</Link>.
            </p>
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
  );
}

export const getServerSideProps: GetServerSideProps = async (
  context
): Promise<GetServerSidePropsResult<EventProps>> => {
  const session = await getSession(context);

  if (context.params === undefined || context.params.slug === undefined) {
    return {
      props: {},
    };
  }
  const slug = context.params.slug as string[];
  if (slug.length === 0) {
    return {
      props: {},
    };
  }
  const pool = createDatabasePool();

  const longEventCode = slug[0]; // The first part of the url is the event code
  const userMagicCode = slug.length > 1 ? slug[1] : null; // The magic code for the user

  const event = await getEventByCode(pool, longEventCode);
  if (event === null) {
    return {
      props: {},
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
      props: {},
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
      userMagicCode,
      weAreTheHost,
      longEventCode,
    },
  };
};

export default Page;
