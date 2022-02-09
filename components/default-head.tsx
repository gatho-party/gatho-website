import Head from "next/head";

export function DefaultHead() {
  return (
    <Head>
      <title>Gatho.party - Better event hosting</title>
      <meta
        name="description"
        content="Gatho - Invite friends to your event with a one-click RSVP link - no matter which chat/social app they use! Includes Matrix integration."
      />

      <meta property="og:url" content="https://gatho.party/" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Gatho.party - Better event hosting" />
      <meta
        property="og:description"
        content="Gatho - Invite friends to your event with a one-click RSVP link - no matter which chat/social app they use! Includes Matrix integration."
      />
      <meta property="og:image" content="/img/opengraph-image.jpg" />

      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Screenshot of Gatho event" />

      <link rel="icon" href="/favicon.ico" />
      <link
        rel="icon"
        type="image/png"
        href="/img/android-chrome-192x192.png"
        sizes="192x192"
      ></link>
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/img/apple-touch-icon.png"
      />
      <link rel="shortcut icon" href="" />
      <meta name="author" content="Jake Coppinger"></meta>
    </Head>
  );
}
