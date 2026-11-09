import { setGlobalDispatcher, Agent } from "undici";

// Configure undici with infinite body and headers timeout to prevent premature socket aborts
setGlobalDispatcher(
  new Agent({
    bodyTimeout: 0,
    headersTimeout: 0,
    connectTimeout: 180000,
    keepAliveTimeout: 60000,
  })
);

