import { Status } from "./common-interfaces";

export const statusMap: Record<Status, string> = {
  invited: "Invited",
  maybe: "Maybe",
  notgoing: "Can't go",
  going: "Going"
};
export const statuses: Status[] = ['going', 'maybe', 'notgoing', 'invited'];

export const secret_matrix_bot_key = process.env.SECRET_MATRIX_BOT_KEY;