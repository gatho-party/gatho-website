import { AuthenticatedIndexProps} from "../src/interfaces";
import styles from "../styles/Home.module.css";
import {
  createEventFromFrontend,
} from "../src/frontend-utils";
import { EventDetails } from "../src/common-interfaces";
import { useRouter } from "next/router";
import { Footer } from "./footer";
import { GathoLogo } from "./gatho-logo";
import { LoggedInDisplay } from "./logged-in-display";
import Link from "next/link";

function EventDetails({ events }: { events: EventDetails[] }) {
  return (
    <div className="event-details-component">
      {events.map((event) => (
        <div key={event.id} className={"my-event"}>
          <h1>
            <a key={event.code} href={`/event/${event.code}`}>
              {event.name === undefined || event.name === ""
                ? `[New event]`
                : event.name}
            </a>
          </h1>
          <h3>
            📍{" "}
            {event.place === undefined || event.place === ""
              ? `[Event Location]`
              : event.place}
          </h3>
          <h3>
            🕦{" "}
            {event.time === undefined || event.time === ""
              ? `[Event Time]`
              : event.time}
          </h3>
          <p>
            {event.description === undefined || event.description === ""
              ? `[Event Description]`
              : event.description}
          </p>
        </div>
      ))}
    </div>
  );
}
export function AuthenticatedIndex({
  events,
  authenticatedUser,
}: AuthenticatedIndexProps) {
  const router = useRouter();
  
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <LoggedInDisplay authenticatedUser={authenticatedUser} />
        <GathoLogo />

        <h1>Events you&apos;re hosting</h1>
        <EventDetails events={events} />
        <div>
          <h1>Create new event</h1>
          <h3>
            <Link href="/getting-started">Read the getting started guide</Link>{" "}
            or dive right in!
          </h3>
          <button
            className="create-new-event"
            onClick={async () => {
              const code = await createEventFromFrontend({
                name: "",
                description: "",
                place: "",
                time: "",
                matrix_room_address: "",
                matrix_rsvp_message: "",
              });

              router.push(`/event/${code}`);
            }}
          >
            Create event!
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
