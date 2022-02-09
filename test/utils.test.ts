import { parseMatrixEntityUrl} from "../src/frontend-utils";
import { parseMatrixUsernamePretty } from "../src/fullstack-utils";

describe("#parseMatrixUsernamePretty()", () => {
  test("parses name correctly", async () => {
    const name = parseMatrixUsernamePretty("@Jake:somedomain.com");
    expect(name).toBe('Jake');
  });
  test("return original when without @", async () => {
    const name = parseMatrixUsernamePretty("Jake:somedomain.com");
    expect(name).toBe('Jake:somedomain.com');
  });
  test("return original when without :", async () => {
    const name = parseMatrixUsernamePretty("@Jakesomedomain.com");
    expect(name).toBe('@Jakesomedomain.com');
  });
});

describe("#parseMatrixEntityUrl()", () => {
  test("parses room name from matrix.to invite url", async () => {
    const inviteUrl =
      "https://matrix.to/#/!blah:somedomain.com?via=somedomain.com&via=someotherdomain"
    const room = parseMatrixEntityUrl(inviteUrl);
    expect(room).toBe('!blah:somedomain.com');
  });
  test("returns null when no room in link", async () => {
    const inviteUrl =
      "https://matrix.to/#/"
    const room = parseMatrixEntityUrl(inviteUrl);
    expect(room).toBe(null);
  });
  test("returns same string when no url", async () => {
    const inviteUrl =
      "!something:somedomain.com"
    const room = parseMatrixEntityUrl(inviteUrl);
    expect(room).toBe(inviteUrl);
  });
  test("returns null when no room in link, but has query parms", async () => {
    const inviteUrl =
      "https://matrix.to/#/?via=somedomain.com&via=someotherdomain"
    const room = parseMatrixEntityUrl(inviteUrl);
    expect(room).toBe(null);
  });
  test("returns name in url when given name", async () => {
    const inviteUrl =
      "https://matrix.to/#/#jakes-debug-blog:somedomain.com"
    const room = parseMatrixEntityUrl(inviteUrl);
    expect(room).toBe("#jakes-debug-blog:somedomain.com");
  });

  test("returns message Id when given message link", async () => {
    const inviteUrl =
      "https://matrix.to/#/!something:somedomain.com/$OA5TmYt8zEzV-C-2nOD0kVEf5GAN-blah?via=somedomain.com&via=someotherdomain"
    const room = parseMatrixEntityUrl(inviteUrl);
    expect(room).toBe("$OA5TmYt8zEzV-C-2nOD0kVEf5GAN-blah");
  });
});