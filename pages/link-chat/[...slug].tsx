import { GetServerSideProps, GetServerSidePropsResult } from "next";
import styles from "../../styles/Home.module.css";
import { getEventByRoomId, getEventsByHostEmail } from "../../src/db";
import Head from "next/head";
import { EventDetails } from "../../src/common-interfaces";
import { useRouter } from "next/router";
import { getSession, useSession } from "next-auth/react";
import Link from "next/link";
import {
  createEventFromFrontend,
  getBySelector,
  updateEventFieldFromFrontend,
} from "../../src/frontend-utils";
import { GathoLogo } from "../../components/gatho-logo";
import { LoggedInDisplay } from "../../components/logged-in-display";
import { Footer } from "../../components/footer";
import { signIn } from "next-auth/react";
import { DefaultHead } from "../../components/default-head";
import {
  createDatabasePool,
} from "../../src/backend-utils";
import { GeoProps } from "../../src/interfaces";

function Page({
  mode,
  events,
  linkedEvent,
  roomId,
}: LinkProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const refreshData = () => {
    router.replace(router.asPath);
  };

  return (
      <div className={`${styles.container} event`}>
        <DefaultHead />
        <Head>
          <title>Link Room - Gatho</title>
        </Head>

        <main className={styles.main}>
          <LoggedInDisplay authenticatedUser={session?.user?.email} />
          <Link href="/" passHref>
            <a>
              <GathoLogo className={"smallEventLogo"} />
            </a>
          </Link>

          <h1>Link Room</h1>

          {mode === "display_sign_in_prompt" ? (
            <div>
              <h2>Sign in to create or link an event!</h2>
              <button onClick={() => signIn(undefined)}>
                Sign in / Sign up
              </button>
            </div>
          ) : (
            <p>
              Matrix room{" "}
              {mode === "event_already_linked" ? "linked" : " to link"}:{" "}
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://matrix.to/#/${roomId}`}
              >
                {roomId}
              </a>
            </p>
          )}

          {mode === "event_already_linked" && linkedEvent !== undefined ? (
            <div>
              <h2>
                This chat is linked to your event:{" "}
                <a href={`/event/${linkedEvent.code}`}>{linkedEvent.name}</a>
              </h2>

              <h2>
                Next: to track emoji responses to a particular message, copy the
                message URL and add to the event page.
              </h2>
            </div>
          ) : null}

          {mode === "choose-event-or-create-new" &&
          events !== undefined &&
          events !== null &&
          roomId !== undefined ? (
            <div>
              <label htmlFor="my-events">Choose an existing event: </label>
              <select name="my-events" id="my-events">
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
              <button
                id="link-event"
                onClick={async () => {
                  const eventIdStr =
                    getBySelector<HTMLSelectElement>("#my-events").value;
                  const eventId = parseInt(eventIdStr);
                  const response = await updateEventFieldFromFrontend({
                    eventId,
                    field: "matrix_room_address",
                    value: roomId,
                  });
                  if (response.status === 200) {
                    alert("Successfully linked event");
                    console.log(response.body);
                    refreshData();
                  }
                }}
              >
                Link to event!
              </button>
              <p>Or:</p>
            </div>
          ) : null}
          {mode === "choose-event-or-create-new" && roomId ? (
            <div>
              <button
                className="create-new-event"
                onClick={async () => {
                  const code = await createEventFromFrontend({
                    name: "",
                    description: "",
                    place: "",
                    time: "",
                    matrix_room_address: roomId,
                    matrix_rsvp_message: "",
                  });

                  router.push(`/event/${code}`);
                }}
              >
                Create event!
              </button>
            </div>
          ) : null}
        </main>
        <Footer />
      </div>
  );
}
interface LinkProps extends GeoProps {
  events?: EventDetails[] | null;
  mode:
    | "link-invalid"
    | "display_sign_in_prompt"
    | "event_already_linked"
    | "choose-event-or-create-new";
  linkedEvent?: EventDetails;
  roomId?: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context
): Promise<GetServerSidePropsResult<LinkProps>> => {
  if (context.params === undefined || context.params.slug === undefined) {
    return { props: { mode: "link-invalid" } };
  }

  const pool = createDatabasePool();
  const session = await getSession(context);
  if (
    session === undefined ||
    session?.user?.email === undefined ||
    session.user.email === null
  ) {
    return {
      props: { mode: "display_sign_in_prompt" },
    };
  }

  const slug = context.params.slug as string[];
  if (slug.length === 0) {
    return { props: { mode: "link-invalid" } };
  }

  const roomId = slug[0]; // The first part of the url is the event code

  const maybeExistingEvent = await getEventByRoomId(pool, roomId);
  if (maybeExistingEvent !== null) {
    return {
      props: {
        mode: "event_already_linked",
        linkedEvent: maybeExistingEvent,
        roomId,
      },
    };
  }

  const events = await getEventsByHostEmail(pool, session.user.email);

  // Pass data to the page via props
  return {
    props: {
      events,
      mode: "choose-event-or-create-new",
      roomId,
    },
  };
};

export default Page;
