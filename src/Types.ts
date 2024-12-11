export interface GolemSelections {
    body: GolemBodySelection
    catalyst: GolemSelection
    atzmus: GolemSelection
    armament: GolemSelection
    incantation: GolemSelection
    hamsa: GolemSelection
}

export interface GolemSelection {
    value: string
    effect: string
}

export interface GolemBodySelection extends GolemSelection {
    image: string
}