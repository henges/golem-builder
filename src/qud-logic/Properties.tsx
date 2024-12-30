import { Box, Text } from "@chakra-ui/react";
import { ExportGolem, ExportMutation } from "../ExportTypes";
import { DefaultQudObjectProperties, QudObjectProperties } from "./QudTypes";
import { GetModified, BoostStat, GetModifier, GetStatAverage, IncrementStat, NewValueStat, ProcessStat, Stat } from "./Stat";

const BodyHasSpecialProperties = (g: ExportGolem) => {
    return g.mutations.length > 0 || g.skills.length > 0 || g.flags.mentalShield;
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
    return ret;
}

// see XRL.World.Quests.GolemQuest.GolemBodySelection.Apply
export const ApplyGolemBodySelection = (props: QudObjectProperties) => {
    IncrementStat(props.physics.av, 10);
    BoostStat(props.attributes.strength, 3);
    BoostStat(props.attributes.toughness, 2);
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

const GetBodyInterestingStats = (g: ExportGolem) => {

    const props = ComputeQudObjectProperties(g);
    ApplyGolemBodySelection(props);
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

export const GetBodySpecialPropertiesElement = (g?: ExportGolem) => {

    if (!g) {
        return null;
    }
    const hasSpecialProperties = BodyHasSpecialProperties(g);
    const interestingStats = GetBodyInterestingStats(g);
    if (!hasSpecialProperties && interestingStats.length === 0) {
        return null;
    }
    return (
    <Box>
        {g.mutations.length === 0 ? null : 
            <Text>Mutations: {g.mutations.map(m => FormatMutation(m)).join(", ")}</Text>
        }
        {g.skills.length === 0 ? null : 
            <Text>Skills: {g.skills.join(", ")}</Text>
        }
        {!g.flags.mentalShield ? null : 
            <Text>Has a mental shield</Text>
        }
        {interestingStats.map(is => (<Text>{is}</Text>))}
    </Box>
    )
}