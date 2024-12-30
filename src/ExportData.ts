export type ExportData = {
    Liquids: Liquids
    Catalysts: Effects
    Incantations: object
    Hamsas: object
}

export type Liquids = Record<string, Liquid>;

export type Effects = Record<string, GameObjectUnit[]>;

export type Liquid = {
    id: string
    name: string
    colors: string[]
}

export type GameObjectUnit = {
    UnitType: string
    UnitDescription: string
}