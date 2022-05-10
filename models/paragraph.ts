import type { Entity } from "./entity";

export interface Paragraph extends Entity {
  seq: number;
  tagName: string;
  articleId: number;
}
