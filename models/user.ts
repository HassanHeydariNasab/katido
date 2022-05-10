import type { Entity } from "./entity";

export interface User extends Entity {
  name: string;
  email: string;
  coins: number;
}
