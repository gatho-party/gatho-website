import PlausibleProvider from "next-plausible";
import type { GetServerSideProps, GetServerSidePropsResult } from "next";
import { EventDetails } from "../src/common-interfaces";
import { getCsrfToken, getSession } from "next-auth/react";
import { getEventsByHostEmail } from "../src/db";
import { IndexProps } from "../src/interfaces";
import { UnauthenticatedIndex } from "../components/unauthenticated-index";
import { AuthenticatedIndex } from "../components/authenticated-index";
import { DefaultHead } from "../components/default-head";
import {
  createDatabasePool,
} from "../src/backend-utils";
import React from "react";

function Home({
  events,
  authenticatedUser,
  csrfToken
}: IndexProps) {
  return (
    <div>
        <PlausibleProvider domain={"gatho.party"}>
          <DefaultHead />

          {events !== undefined && authenticatedUser !== undefined ? (
            <AuthenticatedIndex
              events={events}
              authenticatedUser={authenticatedUser}
            />
          ) : (
            <UnauthenticatedIndex csrfToken={csrfToken}/>
          )}
        </PlausibleProvider>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (
  context
): Promise<GetServerSidePropsResult<IndexProps>> => {
  const { req } = context;
  const pool = createDatabasePool();
  const session = await getSession({ req });
  const csrfToken = await getCsrfToken(context);
  if (
    session === null ||
    session?.user?.email === undefined ||
    session.user.email === null
  ) {
    return {
      props: {
        csrfToken
      },
    };
  }
  const email = session.user.email;
  const events: EventDetails[] | null = await getEventsByHostEmail(pool, email);
  if (events === null) {
    return {
      props: { csrfToken },
    };
  }
  return {
    props: {
      events,
      authenticatedUser: email,
      csrfToken
    },
  };
};

export default Home;
