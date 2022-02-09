import { signIn} from "next-auth/react";

export function SigninSignupButton() {
  return (
    <div className="signin-button">
      <button onClick={() => signIn()}>Sign in / Sign up</button>
    </div>
  );
}