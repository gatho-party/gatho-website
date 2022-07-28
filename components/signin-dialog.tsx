import { signIn } from "next-auth/react";
import { getBySelector } from "../src/frontend-utils";

export function SigninDialog({ csrfToken }: { csrfToken: string | undefined }) {
  return (
    <div id="signin-landing">
      <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
      <input
        type="email"
        id="email"
        name="email"
        placeholder="email@example.com"
      />
      <button
        id="signin-button"
        onClick={() => {
          const email = getBySelector<HTMLInputElement>("#email").value;
          if (email === undefined) {
            return;
          }
          const button = getBySelector<HTMLButtonElement>(`#signin-button`);
          button.innerHTML = "Signing in...";
          button.disabled = true;
          signIn("email", { email });
        }}
      >
        Sign in / Sign up
      </button>
    </div>
  );
}
