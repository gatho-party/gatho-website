import styles from "../styles/Home.module.css";
import Link from "next/link";

export function Footer() {
  return (
    <footer className={`${styles.footer} footer`}>
      <div className="footerContent">
        <h4>
          <a href="https://gatho.party">Gatho</a> - Invite friends to your event
          with a one-click RSVP link - no matter which chat/social app they use!
        </h4>
        <h5>
          Built from scratch by{" "}
          <a
            href="https://jakecoppinger.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Jake Coppinger
          </a>{" "}
          in Sydney, Australia.
        </h5>
        <p>
          Gatho is open-source (AGPL-3.0) on{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/gatho-party/gatho-website"
          >
            Github
          </a>
          . Join the community on Matrix and ask questions at{" "}
          <a href="https://matrix.to/#/#gatho-events:matrix.org">
            #gatho-events:matrix.org
          </a>
          , or email me at <a href="mailto:jake@gatho.party">jake@gatho.party</a>.
        </p>
        <p>Feedback is much appreciated!</p>
        <p>
          <Link href="/privacy-policy">Privacy policy</Link>

          {"   -  "}
          <Link href="/cookies">Cookies</Link>
          {"   -  "}
          <span>Gatho is hosted in Australia.</span>
        </p>
      </div>
    </footer>
  );
}
