import { Box, Text } from "@chakra-ui/react";
import { AtzmusEffect, ExportGolem, ExportMutation, ExportObjectAtzmus, ExportObjectHamsa, ExportObjectWeapon } from "../ExportTypes";
import { DefaultQudObjectProperties, QudObjectProperties } from "./QudTypes";
import { GetModified, BoostStat, GetModifier, GetStatAverage, IncrementStat, NewValueStat, ProcessStat, Stat, IncrementPercent } from "./Stat";
import { ConditionalGameObjectUnitGroup, GameObjectUnit } from "./GameObjectUnit";
import { applyQudShader } from "../Colours";
import { Pluralise, PluraliseSlot } from "../helpers";
import { QudSpriteRenderer } from "../QudSpriteRenderer";
import { SelectableListItem } from "../SelectableList";
import { Effects } from "../ExportData";
import { QudInlineSprite } from "../QudInlineSprite";

const BodyHasSpecialProperties = (g: QudObjectProperties) => {
    return g.mutations.length > 0 || g.skills.length > 0 || 
        g.specialProperties.mentalShield || g.specialProperties.saveImmunities.length > 0 || g.specialProperties.carryCapacityIncrease > 0 ||
        g.specialProperties.refractLightChance > 0 || g.stringProperties.length > 0 || g.anatomy.metachromeLimbs;
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

    for (const limb of body.anatomy) {
        AddNonMetachromeLimb(ret, limb.type);
    }
    ret.mutations.push(...body.mutations.map(m => structuredClone(m)));
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

export const ApplyVariant = (props: QudObjectProperties, variant: string[]) => {

    if (!variant || variant.length === 0) {
        return;
    }

    for (const k of variant) {
        AddMetachromeLimb(props, k);
    }
}

export const AddNonMetachromeLimb = (props: QudObjectProperties, limb: string) => {
    if (!props.anatomy.limbs[limb]) {
        props.anatomy.limbs[limb] = 1;
    } else {
        props.anatomy.limbs[limb]++;
    }
}

export const AddMetachromeLimb = (props: QudObjectProperties, limb: string) => {
    if (!props.anatomy.metachromeLimbs[limb]) {
        props.anatomy.metachromeLimbs[limb] = 1;
    } else {
        props.anatomy.metachromeLimbs[limb]++;
    }
}

export const WeaponToGameObjectUnits = (weapon: ExportObjectWeapon): GameObjectUnit[] => {

    return [{
        UnitDescription: `Has every ${weapon.skill} skill`,
        UnitType: "GameObjectSkillUnit",
        Skill: weapon.skill,
        Power: "*",
    }, 
    // Technically true but we do this in a different way
    // {
    //     UnitDescription: `Has {{metachrome|metachrome}} limbs`,
    //     UnitType: "GameObjectMetachromeUnit",
    //     Skill: weapon.skill,
    // }
]
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
        props.stringProperties.push(conditional.units.map(u => FormatGameObjectUnitDescription(u.UnitDescription)).join(" OR\n"))
    }
}

export const FormatGameObjectUnitDescription = (s: string) => s.split("\n").join(", ");

export const GetSelectionEffectKey = (gous: GameObjectUnit[]) => gous.map(gou => FormatGameObjectUnitDescription(gou.UnitDescription)).join(", ")

export const ApplyGameObjectUnits = (props: QudObjectProperties, units: GameObjectUnit[], skipPushDescription?: boolean) => {

    const appendDescription = (s: string) => !skipPushDescription && props.stringProperties.push(FormatGameObjectUnitDescription(s));

    for (const unit of units) {
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
                if (unit.Metachromed) {
                    if (name === "Random") {
                        props.anatomy.randomMetachromedCount++
                    } else {
                        AddMetachromeLimb(props, name);
                    }
                } else {
                    if (name === "Random") {
                        name = "random"
                    };
                    appendDescription(`Extra ${name} slot`);
                }
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
            case "GameObjectPartUnit": {
                switch (unit.Part.PartType) {
                    case "CarryBonus": {
                        if (unit.Part.Props['Style'] === "Percent") {
                            props.specialProperties.carryCapacityIncrease += parseInt(unit.Part.Props['Amount'] as string)
                        } else {
                            appendDescription(unit.UnitDescription);
                            // ???
                        }
                        break;
                    }
                    default: {
                        appendDescription(unit.UnitDescription);
                        break;
                    }
                }
                break;
            }
            // these use the default
            case "GameObjectBaetylUnit":
            case "GameObjectCloneUnit":
            case "GameObjectCyberneticsUnit":
            case "GameObjectGolemQuestRandomUnit":
            case "GameObjectMetachromeUnit": 
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
    isSelected: boolean
}

export const CreateAtzmusListElement = ({name, effect, granters, showModal, setSelection, isSelected}: AtzmusListElementProps) => {

    const base: SelectableListItem = {name: name, isSelected: isSelected};
    switch (effect.type) {
        case "ATTRIBUTE": {
            
            const certains = effect.granters.filter(g => g.certain).map(g => granters[g.id]);
            certains.sort((e1, e2) => e1.grants.length - e2.grants.length);
            const uncertains = effect.granters.filter(g => !g.certain).map(g => granters[g.id]);
            uncertains.sort((e1, e2) => e1.grants.length - e2.grants.length);
            const list = [...certains, ...uncertains];

            base.more = (<Box>
                <Text>{applyQudShader(`{{g|${list.length} possible ${Pluralise("source", list.length)}}}`)}</Text>
            </Box>)
            base.onSelect = () => {showModal(list)}
            return base;
        }
        case "MUTATION": {

            const allPossibleLevels = Object.keys(effect.possibleLevels);
            const guaranteeableLevels = Object.entries(effect.possibleLevels).filter(([_k, v]) => v).map(([k,_v]) => k);
            const nonGuaranteeableLevels = Object.entries(effect.possibleLevels).filter(([_k, v]) => !v).map(([k,_v]) => k);
            const possibleGrantersCountByLevel = Object.entries(effect.grantersByLevel).reduce((agg: Record<string, number>, [k, v]) => {
                agg[k] = v.length;
                return agg;
            }, {});
            const allPossibleGrantersCount = Object.values(possibleGrantersCountByLevel).reduce((agg, e) => agg+e, 0)
            const possibleGranters = Object.values(effect.grantersByLevel).flat().map(g => granters[g.id]);
            possibleGranters.sort((e1, e2) => e1.grants.length - e2.grants.length);

            if (allPossibleLevels.length === guaranteeableLevels.length) {
                if (allPossibleGrantersCount === 1) {
                    const granter = granters[Object.values(effect.grantersByLevel).flat()[0].id];
                    base.onSelect = () => {setSelection(granter.id)}
                    base.more = (<Box>
                            <Text>{applyQudShader(`{{g|Guaranteeable at ${Pluralise("level", allPossibleLevels.length)} ${allPossibleLevels.join(", ")}}}`)},{" "}
                            {"only granted by "}<QudInlineSprite sprite={granter.render}/></Text>
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
                            {"only granted by "}<QudInlineSprite sprite={granter.render}/></Text>
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


export type HamsaVariant = {
    sourcePredicate: (o: ExportObjectHamsa) => boolean
    buildVariant: (gous: GameObjectUnit[]) => [string, GameObjectUnit[]]
}

export const hamsaVariants: Record<string, HamsaVariant> = {'Protection': {
    sourcePredicate: (o: ExportObjectHamsa) => o.dvGtAv,
    buildVariant: (gous: GameObjectUnit[]) => ["Protection_DV", gous.map(g => {
        return g.UnitType !== "GameObjectAttributeUnit" ? g : {...g, UnitType: "GameObjectAttributeUnit", Attribute: "DV", UnitDescription: "+6 DV"}
    })]
}}

export const splitByPredicate = <T,>(objs: T[], pred: (o: T) => boolean): [T[], T[]] => {

    const yes = [];
    const no = [];
    for (const obj of objs) {
        if (pred(obj)) {
            yes.push(obj);
        } else {
            no.push(obj);
        }
    }
    return [yes, no] as const;
}

export interface HamsaListElementProps {
    name: string
    granters: ExportObjectHamsa[]
    effects: Effects
    showModal: (a: HamsaSourceWithEffects[]) => void;
    setSelection: (a: string) => void;
    isSelected: boolean;
}

export type HamsaSourceEffect = [string, GameObjectUnit[]];

export type HamsaSourceEffects = HamsaSourceEffect[];

export type HamsaSourceWithEffects = [ExportObjectHamsa, HamsaSourceEffects];

export const GetValidHamsaEffectsForObj = (selected: ExportObjectHamsa, hamsas: Effects): HamsaSourceEffects => {

    return selected.semanticTags.map(t => [t, hamsas[t] || []] as const).map(([t, gous]) => {
        if (hamsaVariants[t] && hamsaVariants[t].sourcePredicate(selected)) {
            return hamsaVariants[t].buildVariant(gous) as HamsaSourceEffect;
        } else {
            return [t, gous] as HamsaSourceEffect;
        }
    }).filter(([_t, gous]) => gous.length > 0);
}

export const CreateHamsaListElement = ({name, granters, effects, showModal, setSelection, isSelected}: HamsaListElementProps) => {

    const base: SelectableListItem = {name: name, isSelected: isSelected};
    const grantersWithHamsaEffects = granters.map(g => ([g, GetValidHamsaEffectsForObj(g, effects)] as HamsaSourceWithEffects));
    grantersWithHamsaEffects.sort(([_k1, v1], [_k2, v2]) => v1.length - v2.length);
    const nonGuaranteeableGranters = grantersWithHamsaEffects.map(([_k,v]) => v).filter(g => g.length !== 1);
    const guaranteedGranters = grantersWithHamsaEffects.map(([_k,v]) => v).filter(g => g.length === 1);

    if (granters.length === guaranteedGranters.length) {
        if (granters.length === 1) {
            const granter = grantersWithHamsaEffects[0][0];
            base.onSelect = () => {setSelection(granter.id)}
            base.more = (<Box>
                    <Text>{applyQudShader(`{{g|Guaranteed}}`)},{" "}
                    {"only granted by "}<QudSpriteRenderer display="inline" sprite={granter.render}/>{" "}{applyQudShader(granter.render.displayName)}</Text>
                </Box>)
            return base;
        }

        base.onSelect = () => {showModal(grantersWithHamsaEffects)};
        base.more = (<Box>
            <Text>{applyQudShader(`{{g|Guaranteed}}`)},{" "}
                {applyQudShader(`{{O|${grantersWithHamsaEffects.length} possible ${Pluralise("source", grantersWithHamsaEffects.length)}}}`)}</Text>
        </Box>)
        return base;
    } else if (granters.length === nonGuaranteeableGranters.length) {
        if (granters.length === 1) {
            const granter = grantersWithHamsaEffects[0][0];
            base.onSelect = () => {setSelection(granter.id)}
            base.more = (<Box>
                <Text>{applyQudShader(`{{r|Can't be guaranteed}}`)},{" "} 
                    {"only granted by "}<QudSpriteRenderer display="inline" sprite={granter.render}/>{" "}{applyQudShader(granter.render.displayName)}</Text>
            </Box>)
            return base;
        }
        base.onSelect = () => {showModal(grantersWithHamsaEffects)};
        base.more = (<Box>
            <Text>{applyQudShader(`{{r|Can't be guaranteed}}`)},{" "} 
                {applyQudShader(`{{O|${grantersWithHamsaEffects.length} possible ${Pluralise("source", grantersWithHamsaEffects.length)}}}`)}</Text>
            </Box>)
        return base;
    }

    base.onSelect = () => {showModal(grantersWithHamsaEffects)};
    base.more = (<Box>
        {<Text>{applyQudShader(`{{g|Can be guaranteed}}`)}</Text>}
        {<Text>{applyQudShader(`{{O|${grantersWithHamsaEffects.length} possible ${Pluralise("source", grantersWithHamsaEffects.length)}}}`)}</Text>}
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

    interestingIfNotEqual(props.physics.hp, "HP", 500);
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

const normalLimbCounts: Record<string, number> = {
    "Floating Nearby": 1,
    "Face": 1,
    // "Head": 1,
    // "Back": 1,
    "Arm": 2,
    "Hand": 2,
    // "Hands": 1,
    "Thrown Weapon": 1,
    "Missile Weapon": 2
}

const joinLast = (s: string[], sep: string, last: string) => {

    let ret = "";
    for (let i = 0; i < s.length; i++) {
        const isFirst = i === 0
        const isLast = i === s.length - 1
        if (!isFirst) {
            if (s.length === 2) {
                ret += " "
            } else {
                ret += sep;
            }
        }
        if (isLast && s.length > 1) {
            ret += last+" "
        }
        ret += s[i];
    }
    return ret;
}

const LimbsDisplay = (g: QudObjectProperties) => {

    // const bodyPlan = Object.entries(g.anatomy.limbs).map(([k,v]) => `${v} ${Pluralise(k, v)}`).join(", ");
    const good: string[] = [];
    const bad: string[] = [];
    for (const [k,v] of Object.entries(normalLimbCounts)) {
        if (!g.anatomy.limbs[k]) {
            bad.push(`${k}`)
        } else if (g.anatomy.limbs[k] !== v) {
            good.push(`${g.anatomy.limbs[k]} ${PluraliseSlot(k, g.anatomy.limbs[k])}`)
        }
    }
    const final = [];
    if (good.length) {
        final.push(`{{g|${joinLast(good, ", ", "and")}}}`)
    }
    if (bad.length) {
        final.push(`{{r|No ${joinLast(bad, ", ", "or")} slots}}`)
    }

    return final.map(a => (<Text>{applyQudShader(a)}</Text>))
}

const MetachromeLimbsDisplay = (g: QudObjectProperties) => {

    // if (Object.keys(g.anatomy.metachromeLimbs).length === 0) {
    //     return null;
    // }
    const randomCount = g.anatomy.randomMetachromedCount;
    const limbCount = Object.values(g.anatomy.metachromeLimbs).reduce((agg, count) => agg+count, 0) + randomCount;
    if (limbCount === 0) {
        return null;
    }
    const unknownQuantity = g.anatomy.metachromeLimbs["*RANDOM*"] ? 1 : 0;
    
    const typeList = Object.entries(g.anatomy.metachromeLimbs).map(([k, v]) => {
        if (k === "*RANDOM*") {
            return "all limbs of one type chosen at random"
        }
        return `${v} ${Pluralise(k, v)}`;
    });
    if (randomCount > 0) {
        typeList.push(`${randomCount} extra limbs chosen at random`)
    }

    return <Text>{applyQudShader(`${limbCount}${unknownQuantity > 0 ? "+" : ""} {{metachrome|metachrome}} ${Pluralise("limb", limbCount+unknownQuantity)} (${typeList.join(", ")})`)}</Text>
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
        {LimbsDisplay(g)}
        {MetachromeLimbsDisplay(g)}
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