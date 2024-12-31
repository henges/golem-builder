export type GameObjectUnit = GameObjectAttributeUnit |
    GameObjectBaetylUnit |
    GameObjectBodyPartUnit |
    GameObjectCloneUnit |
    GameObjectCyberneticsUnit |
    GameObjectExperienceUnit |
    GameObjectGolemQuestRandomUnit |
    GameObjectMetachromeUnit |
    GameObjectMutationUnit |
    GameObjectPartUnit |
    GameObjectPlaceholderUnit |
    GameObjectRelicUnit |
    GameObjectReputationUnit |
    GameObjectSaveModifierUnit |
    GameObjectSecretUnit |
    GameObjectSkillUnit |
    GameObjectTieredArmorUnit |
    GameObjectUnitAggregate |
    GameObjectUnitSet;

export type BaseGameObjectUnit = {
    UnitDescription: string
}

export type GameObjectAttributeUnit = BaseGameObjectUnit & {
    UnitType: "GameObjectAttributeUnit"
    Attribute: string
    Value: number
    Percent: boolean
}

export type GameObjectBaetylUnit = BaseGameObjectUnit & {
    UnitType: "GameObjectBaetylUnit"
    Amount: string
    Tier: string
    Delay: boolean
}

export type GameObjectBodyPartUnit = BaseGameObjectUnit & {
    UnitType: "GameObjectBodyPartUnit"
    Type: string
    Manager: string
    InsertAfter: string
    OrInsertBefore: string | null
    Category: number
    Laterality: number
    Metachromed: boolean
}

export type GameObjectCloneUnit = BaseGameObjectUnit & {
    UnitType: "GameObjectCloneUnit"
}

export type GameObjectCyberneticsUnit = BaseGameObjectUnit & {
    UnitType: "GameObjectCyberneticsUnit"
    Blueprint: string
    Slot: string
    LicenseStat: string
    Removable: boolean
}

export type GameObjectExperienceUnit = BaseGameObjectUnit & {
    UnitType: "GameObjectExperienceUnit"
    Experience: number
    Levels: number
}

export type GameObjectGolemQuestRandomUnit = BaseGameObjectUnit & {
    UnitType: "GameObjectGolemQuestRandomUnit"
    SelectionID: string
    Description: string
    Amount: number
}

export type GameObjectMetachromeUnit = BaseGameObjectUnit & {
    UnitType: "GameObjectMetachromeUnit"
    Skill: string
}

export type GameObjectMutationUnit = BaseGameObjectUnit & {
    UnitType: "GameObjectMutationUnit"
    Name: string
    Class: string | null
    Level: number
    Enhance: boolean
    ShouldShowLevel: boolean
}

export type GameObjectPartUnit = BaseGameObjectUnit & {
    UnitType: "GameObjectPartUnit"
    Part: object
    Description: string
}

export type Part = {
    PartType: string
    Props: object
}

export type GameObjectPlaceholderUnit = BaseGameObjectUnit & {
    UnitType: "GameObjectPlaceholderUnit"
    Description: string
}

export type GameObjectRelicUnit = BaseGameObjectUnit & {
    UnitType: "GameObjectRelicUnit"
    Tier: string
}

export type GameObjectReputationUnit = BaseGameObjectUnit & {
    UnitType: "GameObjectReputationUnit"
    Faction: string
    Type: string
    Value: number
    Silent: boolean
}

export type GameObjectSaveModifierUnit = BaseGameObjectUnit & {
    UnitType: "GameObjectSaveModifierUnit"
    Vs: string
    Value: number
}

export type GameObjectSecretUnit = BaseGameObjectUnit & {
    UnitType: "GameObjectSecretUnit"
    Amount: number
}

export type GameObjectSkillUnit = BaseGameObjectUnit & {
    UnitType: "GameObjectSkillUnit"
    Skill: string
    Power: string
}

export type GameObjectTieredArmorUnit = BaseGameObjectUnit & {
    UnitType: "GameObjectTieredArmorUnit"
    Tier: string
    Amount: number
    Gigantic: boolean
    Equippable: boolean
}

export type GameObjectUnitAggregate = BaseGameObjectUnit & {
    UnitType: "GameObjectUnitAggregate"
    Units: GameObjectUnit[]
    Description: string
}

export type GameObjectUnitSet = BaseGameObjectUnit & {
    UnitType: "GameObjectUnitSet"
    Units: GameObjectUnit[]
}
