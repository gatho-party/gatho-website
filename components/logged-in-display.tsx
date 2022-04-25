import { signIn, signOut } from "next-auth/react";
export function LoggedInDisplay({
  authenticatedUser,
  unauthenticatedMessage,
}: {
  authenticatedUser: string | null | undefined;
  unauthenticatedMessage?: string;
}) {
  const defaultMessage = unauthenticatedMessage
    ? unauthenticatedMessage
    : "Sign in to create or edit an event";
  return (
    <div className="loggedInDisplay">
      {authenticatedUser ? authenticatedUser : defaultMessage}{" "}
      {authenticatedUser ? ` | Only you can edit ` : ""}{" "}
      {authenticatedUser ? (
        <button onClick={() => signOut()}>Sign out</button>
      ) : (
        <button onClick={() => signIn()}>Sign in / Sign up</button>
      )}
    </div>
  );
}
