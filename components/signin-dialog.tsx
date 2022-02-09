import { getBySelector } from "../src/frontend-utils";

export function SigninDialog({
  csrfToken,
}: {
  csrfToken: string | undefined;
}) {
  return (
    <div id="signin-landing">
      <form method="post" action="/api/auth/signin/email">
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
        <label className="signin-notice">
          You must be at least 16 y/o (GDPR)<br></br>Sign-in uses cookie
        </label>
        <input
          onClick={() => {
            const label = getBySelector<HTMLLabelElement>(".signin-notice");
            label.style.opacity = "initial";
          }}
          onBlur={() => {
            const label = getBySelector<HTMLLabelElement>(".signin-notice");
            label.style.opacity = "0";
          }}
          type="email"
          id="email"
          name="email"
          placeholder="email@example.com"
        />
        <button type="submit">Sign in / Sign up</button>
      </form>
    </div>
  );
}
