import { GettingStartedProps } from "../src/interfaces";
import Head from "next/head";
import { LoggedInDisplay } from "../components/logged-in-display";
import { GathoLogo } from "../components/gatho-logo";
import styles from "../styles/Home.module.css";
import { Footer } from "../components/footer";
import { DefaultHead } from "../components/default-head";
import { SigninSignupButton } from "../components/signin-signup-button";
import { useSession } from "next-auth/react";

function Home({}: GettingStartedProps) {
  const { data: session } = useSession();
  return (
    <div>
      <DefaultHead />
      <Head>
        <title>Getting Started - Gatho</title>
      </Head>
      <div className={styles.container}>
        <LoggedInDisplay authenticatedUser={session?.user?.email} />

        {/* eslint-disable */}
        <a href="/">
          <GathoLogo />
        </a>
        {/* eslint-enable */}
        <div id="getting-started-body">
          <h1>Getting started</h1>
          <h2>How does Gatho work</h2>
          <p>
            After signing in with your email, create an event and add your party
            details, such as title, description, time and place.
          </p>
          <p>
            Add each of your guests to the guestlist and send them their
            personalised invitation link via whichever platform they prefer.
            When they follow their link they will be able to update their RSVP
            status <i>without signing up</i>.
          </p>
          <h2>Matrix integration</h2>
          <p>
            Gatho works great standalone, but it can also integrate with a
            Matrix group chat.
          </p>
          <p>
            The Gatho Bot can track specific emoji reactions to a message asking
            for RSVPs, and then update Gatho with the RSVP status of those
            people. The 👍️ emoji corresponds to &quot;going&quot;, 🤔
            corresponds to &quot;maybe&quot;, and 👎️ corresponds to a
            &quot;can&apos;t go&quot; RSVP.
          </p>
          <p>
            Matrix is a open source, federated chat network with{" "}
            <a
              href="https://matrix.org/clients/"
              target="_blank"
              rel="noopener noreferrer"
            >
              dozens
            </a>{" "}
            of compatible apps - a bit like how a Gmail user can Email a Hotmail
            user. Download a Matrix compatible chat app (like{" "}
            <a
              href="https://element.io/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Element
            </a>
            ) to get started.
          </p>
          <p>
            {" "}
            Once you add the Gatho bot (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://matrix.to/#/@bot:matrix.gatho.party"
            >
              @bot:matrix.gatho.party
            </a>
            ) to your Matrix room it will send a message with a
            &quot;magic&quot; link to associate the chat with your existing
            Gatho event (or create a new one).
          </p>
          <p>
            Invite guests into your chat, and after someone reacts with one of
            the above emoji on a message, all reactions to that message will be
            followed by the Gatho bot and synchronised to your event.
          </p>
          <p>
            Currently the bot only supports unencrypted Matrix rooms, however
            this will change soon. The bot is open source (GNU GPL V3) on{" "}
            <a
              href="https://github.com/gatho-party/gatho-matrix-bot"
              target="_blank"
              rel="noopener noreferrer"
            >
              Github
            </a>
          </p>
          <SigninSignupButton />
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Home;
