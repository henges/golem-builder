export type GolemData = {
    bodies: Record<string, GolemBody>
}

export type GolemBody = {
    body: ExportGolem
    patterns: string[][]
    models: ExportObject[]
    patternMap: Record<string, number> 
}

export type ExportObject = {
    id: string
    render: ExportRender
}

export type ExportGolem = ExportObject & {
    stats: ExportStat[]
    mutations: ExportMutation[]
    anatomy: ExportBodyPart[]
    skills: string[]
    specialProperties: ExportGolemSpecialProperties
}

export type ExportGolemSpecialProperties = {
    mentalShield: boolean
    saveImmunities: string[]
    carryCapacityIncrease: number
    refractLightChance: number
}

export type ExportBodyPart = {
    name: string
    type: string
}

export type ExportStat = {
    name: string,
    type: "SVALUE" | "STATIC",
    value: string
    min: number
    max: number
    sValue?: string
    boost?: string
}

export type ExportMutation = {
    name: string,
    level: string,
    showLevel: boolean,
    defect: boolean
}

export type ExportRender = {
    displayName: string
    tile: string
    mainColour: string
    detailColour: string
}