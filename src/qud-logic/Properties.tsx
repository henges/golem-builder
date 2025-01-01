import { Box, Text } from "@chakra-ui/react";
import { AtzmusEffect, ExportGolem, ExportMutation, ExportObjectAtzmus, ExportObjectHamsa, ExportObjectWeapon } from "../ExportTypes";
import { DefaultQudObjectProperties, QudObjectProperties } from "./QudTypes";
import { GetModified, BoostStat, GetModifier, GetStatAverage, IncrementStat, NewValueStat, ProcessStat, Stat, IncrementPercent } from "./Stat";
import { ConditionalGameObjectUnitGroup, GameObjectUnit } from "./GameObjectUnit";
import { applyQudShader } from "../Colours";
import { Pluralise } from "../helpers";
import { QudSpriteRenderer } from "../QudSpriteRenderer";
import { SelectableListItem } from "../SelectableList";
import { Effects } from "../ExportData";

const BodyHasSpecialProperties = (g: QudObjectProperties) => {
    return g.mutations.length > 0 || g.skills.length > 0 || 
        g.specialProperties.mentalShield || g.specialProperties.saveImmunities.length > 0 || g.specialProperties.carryCapacityIncrease > 0 ||
        g.specialProperties.refractLightChance > 0 || g.stringProperties.length > 0;
}

const FormatMutation = (m: ExportMutation) => {
    return `${m.name}${m.showLevel && m.level ? ` ${m.level}` : ""}`;
}

export const ComputeQudObjectProperties = (body: ExportGolem): QudObjectProperties => {
    const ret = DefaultQudObjectProperties();

    const level = body.stats.find(v => v.name === "Level");
    if (!level) {
        throw new Error(`No level for body selection ${body.id}`);
    }
    const levelVal = parseInt(level.value);
    for (const stat of body.stats) {
        if (stat.name === "Level") {
            ret.physics.level = NewValueStat(level.value);
            continue;
        }
        const result = ProcessStat(levelVal, stat);
        switch (stat.name) {
            case "Hitpoints": ret.physics.hp = result; break;
            case "AV": ret.physics.av = result; break;
            case "DV": ret.physics.dv = result; break;
            case "Strength": ret.attributes.strength = result; break;
            case "Agility": ret.attributes.agility = result; break;
            case "Toughness": ret.attributes.toughness = result; break;
            case "Intelligence": ret.attributes.intelligence = result; break;
            case "Willpower": ret.attributes.willpower = result; break;
            case "Ego": ret.attributes.ego = result; break;
            // case "Energy": ret.<something> = result; break;
            case "Speed": ret.physics.quickness = result; break;
            case "MoveSpeed": ret.physics.moveSpeed = result; break;
            case "XP": ret.physics.xp = result; break;
            case "XPValue": ret.physics.xpValue = result; break;
            // case "SP": ret.<something> = result; break;
            // case "MP": ret.<something> = result; break;
            // case "AP": ret.<something> = result; break;
            case "MA": ret.physics.ma = result; break;
            case "HeatResistance": ret.resistances.heat = result; break;
            case "ColdResistance": ret.resistances.cold = result; break;
            case "ElectricResistance": ret.resistances.electric = result; break;
            case "AcidResistance": ret.resistances.acid = result; break;
        }
    }

    ret.mutations.push(...body.mutations);
    ret.skills.push(...body.skills);
    ret.specialProperties = structuredClone(body.specialProperties);
    return ret;
}

// see XRL.World.Quests.GolemQuest.GolemBodySelection.Apply
export const ApplyGolemBodySelection = (props: QudObjectProperties) => {
    IncrementStat(props.physics.av, 10);
    BoostStat(props.attributes.strength, 3);
    BoostStat(props.attributes.toughness, 2);
}

export const WeaponToGameObjectUnits = (weapon: ExportObjectWeapon): GameObjectUnit[] => {

    return [{
        UnitDescription: `Has every ${weapon.skill} skill`,
        UnitType: "GameObjectSkillUnit",
        Skill: weapon.skill,
        Power: "*",
    }, {
        UnitDescription: `Has {{metachrome|metachrome}} limbs`,
        UnitType: "GameObjectMetachromeUnit",
        Skill: weapon.skill,
    }]
}

export const ApplyStandardModifiers = (props: QudObjectProperties) => {

    // Base DV is 6
    IncrementStat(props.physics.dv, 6); 
    // DV is modified by agility mod
    props.physics.dv = GetModified(props.physics.dv, GetModifier(props.attributes.agility));
    // Base MA is 4
    IncrementStat(props.physics.ma, 4);
    props.physics.ma = GetModified(props.physics.ma, GetModifier(props.attributes.willpower));
}

export const FindStat = (props: QudObjectProperties, statName: string) => {

    switch (statName) {
        case "Hitpoints": return props.physics.hp;
        case "AV": return props.physics.av;
        case "DV": return props.physics.dv;
        case "Strength": return props.attributes.strength;
        case "Agility": return props.attributes.agility;
        case "Toughness": return props.attributes.toughness;
        case "Intelligence": return props.attributes.intelligence;
        case "Willpower": return props.attributes.willpower;
        case "Ego": return props.attributes.ego;
        case "Speed": return props.physics.quickness;
        case "MoveSpeed": return props.physics.moveSpeed;
        case "XP": return props.physics.xp;
        case "XPValue": return props.physics.xpValue;
        case "MA": return props.physics.ma;
        case "HeatResistance": return props.resistances.heat;
        case "ColdResistance": return props.resistances.cold;
        case "ElectricResistance": return props.resistances.electric;
        case "AcidResistance": return props.resistances.acid;
    }
}

export const ApplyConditionalGameObjectUnits = (props: QudObjectProperties, conditional: ConditionalGameObjectUnitGroup) => {

    if (conditional.certain) {
        ApplyGameObjectUnits(props, conditional.units);
    } else {
        props.stringProperties.push(conditional.units.map(u => u.UnitDescription).join(" OR\n"))
    }
}

export const FormatGameObjectUnitDescription = (s: string) => s.split("\n").join(", ");

export const ApplyGameObjectUnits = (props: QudObjectProperties, units: GameObjectUnit[], skipPushDescription?: boolean) => {

    const appendDescription = (s: string) => !skipPushDescription && props.stringProperties.push(FormatGameObjectUnitDescription(s));

    for (const unit of units) {
        console.log(unit)
        switch (unit.UnitType) {
            case "GameObjectAttributeUnit": {
                const stat = FindStat(props, unit.Attribute);
                if (stat) {
                    if (unit.Percent) {
                        IncrementPercent(stat, unit.Value/100);
                    } else {
                        IncrementStat(stat, unit.Value);
                    }
                } else {
                    appendDescription(unit.UnitDescription);
                }
                break;
            }
            case "GameObjectBodyPartUnit": {
                let name = unit.Type;
                if (name === "Random") {
                    name = "random"
                };
                appendDescription(`Extra ${name} slot`);
                break;
            }
            case "GameObjectExperienceUnit": {
                // Nothing uses the 'experience' property currently AFAIK
                props.physics.level.value += unit.Levels;
                appendDescription(unit.UnitDescription);
                break;
            }
            case "GameObjectMutationUnit": {
                let found = false;
                for (const mut of props.mutations) {
                    if (mut.name === unit.Name) {
                        const lv = parseInt(mut.level || "0");
                        mut.level = (lv+unit.Level).toString();
                        found = true;
                        break;
                    }
                }
                if (found) {
                    break;
                }
                props.mutations.push({name: unit.Name, level: unit.Level.toString(), showLevel: unit.ShouldShowLevel, defect: false})
                break;
            }
            // case "GameObjectPlaceholderUnit": just a placeholder
            // case "GameObjectRelicUnit": never actually used
            case "GameObjectReputationUnit": { 
                appendDescription("+1000 reputation with factions the depicted creature is a member of");
                break;
            }
            case "GameObjectSaveModifierUnit": {
                for (const immunity of props.specialProperties.saveImmunities) {
                    if (immunity === unit.Vs) {
                        break;
                    }
                } 
                props.specialProperties.saveImmunities.push(unit.Vs);
                break;
            }
            case "GameObjectUnitAggregate":
            case "GameObjectUnitSet": {
                ApplyGameObjectUnits(props, unit.Units, true);
                appendDescription(unit.UnitDescription);
                break;
            }
            // these use the default
            case "GameObjectBaetylUnit":
            case "GameObjectCloneUnit":
            case "GameObjectCyberneticsUnit":
            case "GameObjectGolemQuestRandomUnit":
            case "GameObjectMetachromeUnit": 
            case "GameObjectPartUnit": // TODO implement this one
            case "GameObjectSecretUnit":
            case "GameObjectSkillUnit": // TODO implement this one
            case "GameObjectTieredArmorUnit":
            default: {
                appendDescription(unit.UnitDescription);
                break;
            }
        }

    }
}

export interface AtzmusListElementProps {
    name: string
    effect: AtzmusEffect
    granters: Record<string, ExportObjectAtzmus>
    showModal: (a: ExportObjectAtzmus[]) => void;
    setSelection: (a: string) => void;
}

export const CreateAtzmusListElement = ({name, effect, granters, showModal, setSelection}: AtzmusListElementProps) => {

    const base: SelectableListItem = {name: name};
    switch (effect.type) {
        case "ATTRIBUTE": {
            
            base.more = (<Box>
                <Text>{applyQudShader(`{{g|${effect.granters.length} possible ${Pluralise("source", effect.granters.length)}}}`)}</Text>
            </Box>)
            base.onSelect = () => {showModal(effect.granters.map(g => granters[g.id]))}
            return base;
        }
        case "MUTATION": {

            const allPossibleLevels = Object.keys(effect.possibleLevels);
            const guaranteeableLevels = Object.entries(effect.possibleLevels).filter(([k, v]) => v).map(([k,v]) => k);
            const nonGuaranteeableLevels = Object.entries(effect.possibleLevels).filter(([k, v]) => !v).map(([k,v]) => k);
            const possibleGrantersCountByLevel = Object.entries(effect.grantersByLevel).reduce((agg: Record<string, number>, [k, v]) => {
                agg[k] = v.length;
                return agg;
            }, {});
            const allPossibleGrantersCount = Object.values(possibleGrantersCountByLevel).reduce((agg, e) => agg+e, 0)
            const possibleGranters = Object.values(effect.grantersByLevel).flat().map(g => granters[g.id]);

            if (allPossibleLevels.length === guaranteeableLevels.length) {
                if (allPossibleGrantersCount === 1) {
                    const granter = granters[Object.values(effect.grantersByLevel).flat()[0].id];
                    base.onSelect = () => {setSelection(granter.id)}
                    base.more = (<Box>
                            <Text>{applyQudShader(`{{g|Guaranteeable at ${Pluralise("level", allPossibleLevels.length)} ${allPossibleLevels.join(", ")}}}`)},{" "}
                            {"only granted by "}<QudSpriteRenderer display="inline" sprite={granter.render}/>{" "}{applyQudShader(granter.render.displayName)}</Text>
                        </Box>)
                    return base;
                }

                base.onSelect = () => {showModal(possibleGranters)};
                base.more = (<Box>
                    <Text>{applyQudShader(`{{g|Guaranteeable at ${Pluralise("level", allPossibleLevels.length)} ${allPossibleLevels.join(", ")}}}`)},{" "}
                        {applyQudShader(`{{O|${allPossibleGrantersCount} possible ${Pluralise("source", allPossibleGrantersCount)}}}`)}</Text>
                </Box>)
                return base;
            } else if (allPossibleLevels.length === nonGuaranteeableLevels.length) {
                if (allPossibleGrantersCount === 1) {
                    const granter = granters[Object.values(effect.grantersByLevel).flat()[0].id];
                    base.onSelect = () => {setSelection(granter.id)}
                    base.more = (<Box>
                        <Text>{applyQudShader(`{{r|Available at ${Pluralise("level", allPossibleLevels.length)} ${allPossibleLevels.join(", ")}, can't be guaranteed}}`)},{" "} 
                            {"only granted by "}<QudSpriteRenderer display="inline" sprite={granter.render}/>{" "}{applyQudShader(granter.render.displayName)}</Text>
                    </Box>)
                    return base;
                }
                base.onSelect = () => {showModal(possibleGranters)};
                base.more = (<Box>
                    <Text>{applyQudShader(`{{r|Available at ${Pluralise("level", allPossibleLevels.length)} ${allPossibleLevels.join(", ")}, can't be guaranteed}}`)},{" "} 
                    {applyQudShader(`{{O|${allPossibleGrantersCount} possible ${Pluralise("source", allPossibleGrantersCount)}}}`)}</Text>
                    </Box>)
                return base;
            }

            base.onSelect = () => {showModal(possibleGranters)};
            base.more = (<Box>
                <Text>{applyQudShader(`{{g|Available at ${Pluralise("level", allPossibleLevels.length)} ${allPossibleLevels.join(", ")}}}`)}</Text>
                {guaranteeableLevels.length === 0 ? null : <Text>{applyQudShader(`{{g|Can be guaranteed at ${Pluralise("level", guaranteeableLevels.length)} ${guaranteeableLevels.map(g => `{{g|${g}}} {{O|(${possibleGrantersCountByLevel[g]})}}`).join(", ")}}}`)}</Text>}
                {nonGuaranteeableLevels.length === 0 ? null : <Text>{applyQudShader(`{{r|Can't be guaranteed at ${Pluralise("level", nonGuaranteeableLevels.length)}}} ${nonGuaranteeableLevels.map(g => `{{r|${g}}} {{O|(${possibleGrantersCountByLevel[g]})}}`).join(", ")}`)}</Text>}
            </Box>)
            return base;
        }
    }
}


export interface HamsaListElementProps {
    name: string
    granters: string[]
    effects: Effects,
    allGranters: Record<string, ExportObjectHamsa>
    showModal: (a: ExportObjectHamsa[]) => void;
    setSelection: (a: string) => void;
}

export const GetValidHamsaEffectsForObj = (selected: ExportObjectHamsa, hamsas: Effects) => {

    return selected.semanticTags.map(t => hamsas[t]).flat().filter(t => t !== undefined);
}

export const CreateHamsaListElement = ({name, granters, effects, allGranters, showModal, setSelection}: HamsaListElementProps) => {

    const base: SelectableListItem = {name: name};
    const granterHamsaEffects = granters.map(g => GetValidHamsaEffectsForObj(allGranters[g], effects));
    const nonGuaranteeableGranters = granterHamsaEffects.filter(g => g.length !== 1);
    const guaranteedGranters = granterHamsaEffects.filter(g => g.length === 1);
    const granterRenders = granters.map(g => allGranters[g]);

    if (granters.length === guaranteedGranters.length) {
        if (granters.length === 1) {
            const granter = granterRenders[0];
            base.onSelect = () => {setSelection(granter.id)}
            base.more = (<Box>
                    <Text>{applyQudShader(`{{g|Guaranteed}}`)},{" "}
                    {"only granted by "}<QudSpriteRenderer display="inline" sprite={granter.render}/>{" "}{applyQudShader(granter.render.displayName)}</Text>
                </Box>)
            return base;
        }

        base.onSelect = () => {showModal(granterRenders)};
        base.more = (<Box>
            <Text>{applyQudShader(`{{g|Guaranteed}}`)},{" "}
                {applyQudShader(`{{O|${granterRenders.length} possible ${Pluralise("source", granterRenders.length)}}}`)}</Text>
        </Box>)
        return base;
    } else if (granters.length === nonGuaranteeableGranters.length) {
        if (granters.length === 1) {
            const granter = granterRenders[0];
            base.onSelect = () => {setSelection(granter.id)}
            base.more = (<Box>
                <Text>{applyQudShader(`{{r|Can't be guaranteed}}`)},{" "} 
                    {"only granted by "}<QudSpriteRenderer display="inline" sprite={granter.render}/>{" "}{applyQudShader(granter.render.displayName)}</Text>
            </Box>)
            return base;
        }
        base.onSelect = () => {showModal(granterRenders)};
        base.more = (<Box>
            <Text>{applyQudShader(`{{r|Can't be guaranteed}}`)},{" "} 
                {applyQudShader(`{{O|${granterRenders.length} possible ${Pluralise("source", granterRenders.length)}}}`)}</Text>
            </Box>)
        return base;
    }

    base.onSelect = () => {showModal(granterRenders)};
    base.more = (<Box>
        {<Text>{applyQudShader(`{{g|Can be guaranteed}}`)}</Text>}
        {<Text>{applyQudShader(`{{O|${granterRenders.length} possible ${Pluralise("source", granterRenders.length)}}}`)}</Text>}
    </Box>)
    return base;
}

const GetBodyInterestingStats = (props: QudObjectProperties) => {

    const ret: string[] = [];
    const interestingIfNotEqual = (s: Stat, name: string, ifNotEqual: number, format?: (v: number) => number) => {
        if (s.type === "VALUE" && s.value !== ifNotEqual) {
            let v = s.value-ifNotEqual;
            if (format) {
                v = format(s.value);
            }
            ret.push(`${v>0?"+":""}${v} ${name}`);
        }
    }
    const determineStatCategory = (s: Stat, name: string, veryLow: number, low: number, high: number, veryHigh: number) => {
        const v = GetStatAverage(s);
        const formatted = s.type === "VALUE" ? `(${v})` : `(avg ${v})`;
        if (v <= veryLow) {
            ret.push(`Very low ${name} ${formatted}`)
        } else if (v <= low) {
            ret.push(`Low ${name} ${formatted}`)
        } else if (v >= veryHigh) {
            ret.push(`Very high ${name} ${formatted}`)
        } else if (v > high) {
            ret.push(`High ${name} ${formatted}`)
        }
    }

    interestingIfNotEqual(props.physics.av, "AV", 10);
    interestingIfNotEqual(props.physics.dv, "DV", 0);
    interestingIfNotEqual(props.physics.quickness, "Quickness", 100);
    interestingIfNotEqual(props.physics.moveSpeed, "Move Speed", 100, (v) => 100-v);

    interestingIfNotEqual(props.resistances.heat, "Heat Resist", 0);
    interestingIfNotEqual(props.resistances.cold, "Cold Resist", 0);
    interestingIfNotEqual(props.resistances.acid, "Acid Resist", 0);
    interestingIfNotEqual(props.resistances.electric, "Electric Resist", 0);

    determineStatCategory(props.attributes.strength, "Strength", 10, 18, 50, 70);
    determineStatCategory(props.attributes.agility, "Agility", 10, 18, 50, 70);
    determineStatCategory(props.attributes.toughness, "Toughness", 10, 18, 50, 70);

    determineStatCategory(props.attributes.intelligence, "Intelligence", 9, 15, 30, 50);
    determineStatCategory(props.attributes.willpower, "Willpower", 9, 15, 30, 50);
    determineStatCategory(props.attributes.ego, "Ego", 9, 15, 30, 50);
    // props.attributes.
    return ret;
}

const saveModToDisplayName: Record<string, string> = {
    "Move": "forced movement",
    "Slip": "slipping",
    "Disease": "disease",
    "Overdosing": "overdosing",
    "Stuck": "becoming stuck"
}

export const BuildGolemBody = (g?: ExportGolem) => {
    if (!g) {
        return undefined;
    }

    const props = ComputeQudObjectProperties(g);
    ApplyGolemBodySelection(props);
    return props;
}

export const GetBodySpecialPropertiesElement = (g?: QudObjectProperties) => {

    if (!g) {
        return undefined;
    }
    const hasSpecialProperties = BodyHasSpecialProperties(g);
    const interestingStats = GetBodyInterestingStats(g);
    if (!hasSpecialProperties && interestingStats.length === 0) {
        return undefined;
    }
    return (
    <Box>
        {g.mutations.length === 0 ? null : 
            <Text>Mutations: {g.mutations.map(m => FormatMutation(m)).join(", ")}</Text>
        }
        {g.skills.length === 0 ? null : 
            <Text>Skills: {g.skills.join(", ")}</Text>
        }
        {!g.specialProperties.mentalShield ? null : 
            <Text>Has a mental shield</Text>
        }
        {g.specialProperties.saveImmunities.length === 0 ? null :  
            g.specialProperties.saveImmunities.map(s => <Text>Immune to {saveModToDisplayName[s]}</Text>) 
        }
        {g.specialProperties.refractLightChance === 0 ? null :  
            <Text>{g.specialProperties.refractLightChance}% chance to reflect light-based attacks</Text>
        }
        {g.specialProperties.carryCapacityIncrease === 0 ? null :  
            <Text>+{g.specialProperties.carryCapacityIncrease}% carry capacity</Text>
        }
        {g.stringProperties.length === 0 ? null :  
            g.stringProperties.map(s => <Text>{applyQudShader(s)}</Text>) 
        }
        {interestingStats.map(is => (<Text>{is}</Text>))}
    </Box>
    )
}