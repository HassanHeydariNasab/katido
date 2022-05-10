import type { Entity } from "./entity";

export interface Phrase extends Entity {
  seq: number;
  st: string;
  tt: string | null;
  paragraphId: number;
  translatorId: number;
}
