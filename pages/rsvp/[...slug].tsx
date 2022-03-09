import { GetServerSideProps, GetServerSidePropsResult } from "next";
import styles from "../../styles/Home.module.css";
import { getEventByCode } from "../../src/db";
import Head from "next/head";
import { EventSQL, GuestSQL, Status } from "../../src/common-interfaces";
import Link from "next/link";
import { GathoLogo } from "../../components/gatho-logo";
import { LoggedInDisplay } from "../../components/logged-in-display";
import { Footer } from "../../components/footer";
import { DefaultHead } from "../../components/default-head";
import confetti from 'canvas-confetti';
import {
  createDatabasePool,
  getCountryCode,
  isCountryInEurope,
} from "../../src/backend-utils";
import { GeoProps } from "../../src/interfaces";
import { CountryContext } from "../../src/context";
import {
  addGuestPublic,
  copyToClipboard,
  generateGuestUrl,
  getBySelector,
} from "../../src/frontend-utils";
import { useRouter } from "next/router";

interface EventProps extends GeoProps {
  event?: EventSQL | null;
  guests?: GuestSQL[] | null;
  viewingGuest?: GuestSQL | null;
  email?: string | null;
  weAreTheHost?: boolean;
}

function Page({ event, countryCode, inEurope, email }: EventProps) {
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

  return (
    <CountryContext.Provider value={{ countryCode, inEurope }}>
      <div className={`${styles.container} event`}>
        <DefaultHead />
        <Head>
          <title>RSVP for {event.name} - Gatho</title>
          <meta
            name="description"
            content={`See who's going, and the time and place of "${event.name}"`}
          />
        </Head>

        <main className={styles.main}>
          <Link href="/" passHref>
            <a>
              <GathoLogo className={"smallEventLogo"} />
            </a>
          </Link>
          <h1>RSVP for <Link href={`/event/${event.code}`}>{event.name}</Link></h1>
          <div>
            <input id="name" placeholder="Your name"></input>
          </div>

          <div>
            <label htmlFor="rsvp-status">Your status:
            <select defaultValue="going" name="rsvp-status" id="rsvp-status">
              <option value="going">Going</option>
              <option value="maybe">Maybe</option>
              <option value="notgoing">Not Going</option>
            </select>
            </label>
          </div>
          <button
            id="public-rsvp-button"
            onClick={async () => {
              const status: Status = getBySelector<HTMLSelectElement>(
                "#rsvp-status"
              ).value as Status;

              if(status === 'going') {
                confetti();
              }

              const displayname =
                getBySelector<HTMLInputElement>("#name").value;
              console.log({ status, displayname });

              const maybeGuestCode = await addGuestPublic({
                displayname,
                eventCode: event.code,
                status,
              });
              if (maybeGuestCode === null) {
                alert(
                  "Failed to RSVP, please try again or contact the host :("
                );
                return;
              }
              const guestCode = maybeGuestCode;
              const inviteURL = generateGuestUrl({
                eventCode: event.code,
                guestMagicCode: guestCode,
              });
              await copyToClipboard(inviteURL);
              console.log({ inviteURL });
              alert(
                "Success! Your personal RSVP invite URL has been copied to your clipboard - save this to update your RSVP later!"
              );
              router.replace(`/event/${event.code}`);
            }}
          >
            RSVP!
          </button>
        </main>
      </div>
    </CountryContext.Provider>
  );
}

export const getServerSideProps: GetServerSideProps = async (
  context
): Promise<GetServerSidePropsResult<EventProps>> => {
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

  const event = await getEventByCode(pool, eventCode);
  if (event === null) {
    return {
      props: {
        countryCode,
        inEurope,
      },
    };
  }

  return {
    props: {
      event,
      countryCode,
      inEurope,
    },
  };
};

export default Page;
