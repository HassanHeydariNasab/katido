import type { Entity } from "./entity";

export interface Article extends Entity {
  title: string;
  ownerId: number;
}
