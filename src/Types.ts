export interface GolemSelections {
    body?: GolemBodySelection
    catalyst?: GolemSelection
    atzmus?: GolemSelection
    armament?: GolemSelection
    incantation?: GolemSelection
    hamsa?: GolemSelection
}

export interface GolemSelection {
    value: string
    effect: string[]
    statBoosts: StatBoost[]
    mutationGrants: MutationGrant[]
}

export interface SValueStat {
    stat: string    
    sValue: string
}

export interface StatBoost {
    stat: string
    boost: number
}

export interface MutationGrant {
    mut: string
    level: number
}

export interface GolemBodySelection extends GolemSelection {
    bodyPlan: string[]
    sValueStats: SValueStat[]
    image: string
}