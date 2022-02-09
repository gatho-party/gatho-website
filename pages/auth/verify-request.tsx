import { GettingStartedProps } from "../../src/interfaces";
import Head from "next/head";
import { LoggedInDisplay } from "../../components/logged-in-display";
import { GathoLogo } from "../../components/gatho-logo";
import styles from "../../styles/Home.module.css";
import { Footer } from "../../components/footer";
import { DefaultHead } from "../../components/default-head";
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
          <h1>Check your email!</h1>
          <h2>You&apos;ll receive your sign in link from noreply@mail.gatho.party.</h2>
          <p>If you don&apos;t receive the email check your spam folder</p>

        <Footer />
      </div>
    </div>
  );
}

export default Home;
