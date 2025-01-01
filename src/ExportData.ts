import { GameObjectUnit } from "./qud-logic/GameObjectUnit"

export type ExportData = {
    Liquids: Liquids
    Catalysts: Effects
    Incantations: Effects
    Hamsas: Effects
}

export type Liquids = Record<string, Liquid>;

export type Effects = Record<string, GameObjectUnit[]>;

export type Liquid = {
    id: string
    name: string
    colors: string[]
}