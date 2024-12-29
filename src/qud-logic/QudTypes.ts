import { DefaultStat, Stat, ValueStat } from "./Stat"

export interface QudObjectProperties {
    physics: QudPhysics
    attributes: QudAttributes
    resistances: QudResistances
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
        }
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