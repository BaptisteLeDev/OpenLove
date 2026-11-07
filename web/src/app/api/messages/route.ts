import { listMessages, sendMessage } from "@/features/messages/server/messages";
import {
  message,
  messagesQuery,
  messagesResponse,
  sendMessageInput,
} from "@/shared/contracts/messages";
import { withContract } from "@/shared/http/withContract";

export const GET = withContract(
  { input: messagesQuery, output: messagesResponse, auth: "partner" },
  (query) => listMessages(query),
);

export const POST = withContract(
  { input: sendMessageInput, output: message, auth: "partner" },
  ({ text }, { partner }) => sendMessage(partner, text),
);
