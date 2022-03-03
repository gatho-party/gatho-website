import { useRouter } from "next/router";
import { CreateGuestPayload, EventSQL } from "../src/common-interfaces";
import { getBySelector, getInputValue } from "../src/frontend-utils";

async function addGuest({
  displayname,
  matrix_username,
  eventId,
}: {
  displayname?: string;
  matrix_username?: string;
  eventId: number;
}): Promise<boolean> {
  if (displayname === undefined && matrix_username === undefined) {
    console.error("Both displayname and matrix_username is undefined!");
    return false;
  }
  const data: CreateGuestPayload = {
    displayname,
    matrix_username,
    eventId,
  };
  try {
    await fetch("/api/create-guest", {
      body: JSON.stringify(data),
      method: "POST",
    });
    return true;
  } catch (e) {
    return false;
  }
}

export function AddNewGuest({ event }: { event: EventSQL }) {
  const router = useRouter();
  const refreshData = () => {
    router.replace(router.asPath);
  };
  return (
    <>
      <h3>Add a new guest (only visible to you)</h3>
      <input id="addGuestInput" placeholder="Guest name"></input>
      <button
        id="addGuestButton"
        onClick={async () => {
          const displayname = getInputValue("#addGuestInput");
          getBySelector("#addGuestButton").innerText = "Adding guest...";
          const successfullyAdded = await addGuest({
            displayname,
            matrix_username: undefined,
            eventId: event.id,
          });
          getBySelector("#addGuestButton").innerText = "Add guest";
          getBySelector("#addGuestInput").value = "";

          if (successfullyAdded) {
            alert(
              "Guest added! Now copy their invite link and send it to them."
            );
          } else {
            alert(
              "Failed to add guest - see links in footer for support. Sorry!"
            );
          }

          refreshData();
        }}
      >
        Add guest
      </button>
    </>
  );
}
