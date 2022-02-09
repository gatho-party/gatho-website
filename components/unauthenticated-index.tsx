import styles from "../styles/Home.module.css";
import { UnauthenticatedIndexProps } from "../src/interfaces";
import { Footer } from "./footer";
import Link from "next/link";
import { SigninSignupButton } from "./signin-signup-button";
import { SigninDialog } from "./signin-dialog";

export function UnauthenticatedIndex({ csrfToken }: UnauthenticatedIndexProps) {
  return (
    <div>
      <div className="logobox">
        {/* eslint-disable */}
        {/* The CSS for this img really needs some work :) */}
        <img
          className="landingLogo"
          src="/img/gatho-logo.svg"
          alt="Gatho Logo"
          width="100%"
        />
        {/* eslint-enable */}
        <main className={`${styles.main} landing`}>
          <h2 className="landingHeading">
            Invite friends to your event with a one-click RSVP link - no matter
            which chat/social app they use!
          </h2>

          <SigninDialog csrfToken={csrfToken}></SigninDialog>
        </main>
      </div>

      <div className="mockup-container">
        {/* eslint-disable */}
        <img
          className="mockup"
          src="/img/event-mockup-v1.png"
          alt="Screenshot of an event on Gatho"
        />
        {/* eslint-enable */}
      </div>
      <div className="after-landing"></div>
      <div id="after-mockup-img" className={styles.container}>
        <main className={`${styles.main} landing`}>
          <div className="left-without-float">
            <h3>Simple sign up to host, RSVP without an account</h3>
            <p>
              Add each of your guests to the guestlist and send them their
              personalised invitation link via their preferred social app they
              prefer (eg. Instagram / Signal / WhatsApp / Element).
            </p>
            <p>
              When they follow their link they will be able to update their RSVP
              status - without signing up. Though of course - they might sign up
              to host their next event on Gatho!
            </p>
          </div>

          {/* <img
            src="https://via.placeholder.com/700x1080.png"
            alt="Screenshot of inviting friend over SMS, maybe multiple screenshots of different streams"
          ></img> */}

          <div className="introContainer">
            <div className="left">
              <h3>Optionally sync with your Matrix group chat</h3>
              <p>
                Write your invitation message in a Matrix chat, and ask your
                guests to react with a thumbs up or down. The Gatho bot will add
                those guests and sync their status to the Gatho event page.
              </p>
            </div>
            <div className="right">
              {/* eslint-disable */}
              <img
                src="/img/rsvp-list.png"
                alt="Screenshot of inviting friend over SMS, maybe multiple screenshots of different streams"
              ></img>
              {/* eslint-enable */}
            </div>
          </div>
          <div className={"getting-started-panel"}>
            <h3>
              <Link href="/getting-started">
                Read the getting started guide
              </Link>
            </h3>
            <br />
            <SigninSignupButton />
          </div>
          <div className="after-landing"></div>
        </main>
        <Footer />
      </div>
    </div>
  );
}