import { WebClient } from "@slack/client";

function createWebClient(token) {
  return new WebClient(token);
}

export default createWebClient;
