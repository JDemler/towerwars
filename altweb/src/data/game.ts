import { Field } from "./field";

export type Game = {
    fields: Field[];
    income_cooldown: number;
    state: string;
}