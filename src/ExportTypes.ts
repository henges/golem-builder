export type GolemData = {
    bodies: Record<string, GolemBody>
    atzmuses: ExportAtzmusData
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

export type ExportAtzmusData = {
    effects: Record<string, AtzmusEffect>;
    granters: Record<string, ExportObjectAtzmus>;
}

export type BaseAtzmus = {
    granters: AtzmusGranter[];
    anyCertainSource: boolean;
}

export type AtzmusEffect = AtzmusMutationGrant | AtzmusAttributeGrant;

export type AtzmusMutationGrant = BaseAtzmus & {
    type: "MUTATION";
    mutation: ExportMutation;
}

export type AtzmusAttributeGrant = BaseAtzmus & {
    type: "ATTRIBUTE";
    attribute: string;
}

export type AtzmusGranter = {
    id: string
    certain: boolean
}

export type ExportObjectAtzmus = ExportObject & {
    grants: ExportMutation[] | string[];
}