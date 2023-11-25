import { readable, type Readable } from "svelte/store";
import { DurableObjectGame } from "./connection";
import type { GameConnection } from "./types";

export const gameConnection: Readable<GameConnection> = readable(new DurableObjectGame())