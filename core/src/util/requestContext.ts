import { AsyncLocalStorage } from "async_hooks";
import type { ClientSession } from "mongoose";
export const requestContext = new AsyncLocalStorage<{
  session?: ClientSession;
  requestId: string;
  events: Set<string>;
}>();
export const currentSession = () => requestContext.getStore()?.session;
