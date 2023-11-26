import { readable, type Readable } from "svelte/store";
import { PeerJSGame } from "./connection";

export const gameConnection: Readable<PeerJSGame> = readable(new PeerJSGame())