import { ExportMutation } from "../ExportTypes"
import { DefaultStat, Stat, ValueStat } from "./Stat"

export interface QudObjectProperties {
    physics: QudPhysics
    attributes: QudAttributes
    resistances: QudResistances
    anatomy: {
        metachromeLimbs: Record<string, number>
        randomMetachromedCount: number
    }
    specialProperties: QudSpecialProperties
    mutations: ExportMutation[]
    skills: QudShortSkill[]
    stringProperties: string[]
}

export const DefaultQudObjectProperties = (): QudObjectProperties => {
    return {
        physics: {
            level: DefaultStat(),
            hp: DefaultStat(),
            av: DefaultStat(),
            dv: DefaultStat(),
            quickness: DefaultStat(),
            moveSpeed: DefaultStat(),
            ma: DefaultStat(),
            xp: DefaultStat(),
            xpValue: DefaultStat(),
        },
        anatomy: {
            metachromeLimbs: {},
            randomMetachromedCount: 0
        },
        attributes: {
            strength: DefaultStat(),
            agility: DefaultStat(),
            toughness: DefaultStat(),
            intelligence: DefaultStat(),
            willpower: DefaultStat(),
            ego: DefaultStat(),
        },
        resistances: {
            heat: DefaultStat(),
            cold: DefaultStat(),
            acid: DefaultStat(),
            electric: DefaultStat()
        },
        specialProperties: {
            mentalShield: false,
            saveImmunities: [],
            carryCapacityIncrease: 0,
            refractLightChance: 0
        },
        mutations: [],
        skills: [],
        stringProperties: []
    }
}

export interface QudPhysics {
    level: ValueStat
    hp: Stat
    av: Stat
    dv: Stat
    quickness: Stat
    moveSpeed: Stat
    ma: Stat
    xp: Stat
    xpValue: Stat
}

export interface QudAttributes {
    strength: Stat
    agility: Stat
    toughness: Stat
    intelligence: Stat
    willpower: Stat
    ego: Stat
}

export interface QudResistances {
    heat: Stat
    cold: Stat
    acid: Stat
    electric: Stat
}

export interface QudSpecialProperties {
    mentalShield: boolean
    saveImmunities: string[]
    carryCapacityIncrease: number
    refractLightChance: number
}

export interface QudShortMutation {
    name: string
    level: number
    showLevel: boolean
}

export type QudShortSkill = string;