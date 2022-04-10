import { EventRSVPRecord, LocalstorageInterface } from "../src/common-interfaces";
import { addEventToLocalStorageRSVPs } from "../src/frontend-utils";

describe("#addEventToLocalStorageRSVPs()", () => {
  test("adds event to empty object correctly ", async () => {
    const localStorageRSVPs: LocalstorageInterface = { rsvpedEvents: [] };
    const event: EventRSVPRecord = {
      long_event_code: '123',
      guest_magic_code: '456'
    };
    const newRsvps = addEventToLocalStorageRSVPs(localStorageRSVPs, event);
    const expectedNewRsvps = { rsvpedEvents: [{ long_event_code: '123', guest_magic_code: '456' }] }
    expect(newRsvps).toEqual(expectedNewRsvps)
  });
  test("adds event to object with an existing event", async () => {
    const localStorageRSVPs: LocalstorageInterface = {
      rsvpedEvents: [
        {
          long_event_code: '1',
          guest_magic_code: '111'
        }
      ]
    };
    const event: EventRSVPRecord = {
      long_event_code: '2',
      guest_magic_code: '222'
    };
    const newRsvps = addEventToLocalStorageRSVPs(localStorageRSVPs, event);
    const expectedNewRsvps = {
      rsvpedEvents: [
        { long_event_code: '1', guest_magic_code: '111' },
        { long_event_code: '2', guest_magic_code: '222' }
      ]
    }
    expect(newRsvps).toEqual(expectedNewRsvps)
  });
});
