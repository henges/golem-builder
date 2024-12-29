export interface QudObjectProperties {
    physics: QudPhysics
    attributes: QudAttributes
    resistances: QudResistances
}

export const DefaultQudObjectProperties = (): QudObjectProperties => {
    return {
        physics: {
            level: 0,
            hp: "",
            av: "",
            dv: "",
            quickness: "",
            moveSpeed: "",
            ma: "",
            xp: "",
            xpValue: "",
        },
        attributes: {
            strength: "",
            agility: "",
            toughness: "",
            intelligence: "",
            willpower: "",
            ego: "",
        },
        resistances: {
            heat: "",
            cold: "",
            acid: "",
            electric: ""
        }
    }
}

export interface QudPhysics {
    level: number
    hp: string
    av: string
    dv: string
    quickness: string
    moveSpeed: string
    ma: string
    xp: string
    xpValue: string
}

export interface QudAttributes {
    strength: string
    agility: string
    toughness: string
    intelligence: string
    willpower: string
    ego: string
}

export interface QudResistances {
    heat: string
    cold: string
    acid: string
    electric: string
}