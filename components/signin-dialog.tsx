import { signIn } from "next-auth/react";
import { getBySelector } from "../src/frontend-utils";

const BUTTON_READY = "Sign in / Sign up";
const BUTTON_INPROGRESS = "Signing in...";
export function SigninDialog({ csrfToken }: { csrfToken: string | undefined }) {
  const startSignin = async () => {
    const email = getBySelector<HTMLInputElement>("#email").value;
    if (email === undefined || email === "") {
      return;
    }
    const button = getBySelector<HTMLButtonElement>(`#signin-button`);
    try {
      button.innerHTML = BUTTON_INPROGRESS;
      button.disabled = true;
      const result = await signIn("email", { email });
      if (result === undefined) {
        console.error("why is sign in result undef");
      }
    } catch (e) {
      button.innerHTML = BUTTON_READY;
      button.disabled = false;
      alert(
        "Unknown error while signing in. Please contact Jake, see footer for contact details."
      );
    }
  };

  return (
    <div id="signin-landing">
      <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
      <input
        type="email"
        id="email"
        name="email"
        placeholder="email@example.com"
        onKeyUp={(e) => (e.key === "Enter" ? startSignin() : null)}
      />
      <button id="signin-button" onClick={() => startSignin()}>
        {BUTTON_READY}
      </button>
    </div>
  );
}
