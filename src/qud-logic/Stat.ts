import { ExportStat } from "../ExportTypes";

export const DefaultStat = (): ValueStat => {
    return {type: "VALUE", value: 0}
}

export type Stat = ValueStat | RangeStat;

export type BaseStat = {
    // name: string
    type: "VALUE" | "RANGE"
}

export type ValueStat = BaseStat & {
    type: "VALUE"
    value: number
}
export type RangeStat = BaseStat & {
    type: "RANGE"
    low: number
    high: number
}

export interface StatDefinition {
    name: string,
    type: "SVALUE" | "STATIC",
    value: string
    min: number
    max: number
    sValue?: string
    boost?: string
}

export const IncrementStat = (s: Stat, inc: number) => {
    switch (s.type) {
        case "VALUE": {
            s.value += inc;
            return;
        }
        case "RANGE": {
            s.low += inc;
            s.high += inc;
            return;
        }
    }
}

export const BoostStat = (s: Stat, boost: string | number) => {

    switch (s.type) {
        case "VALUE": {
            s.value = BoostStatValue(s.value, boost);
            return;
        }
        case "RANGE": {
            s.low = BoostStatValue(s.low, boost);
            s.high = BoostStatValue(s.high, boost);
            return;
        }
    }
}

export const FormatStat = (s: Stat): string => {
    switch (s.type) {
        case "VALUE": return s.value.toString();
        case "RANGE": return `${s.low}-${s.high}`;
    }
}

export const ProcessStat = (level: number, stat: StatDefinition): Stat => {

    switch (stat.type) {
        case "STATIC": return NewValueStat(stat.value);
        case "SVALUE": return ProcessSValue(level, stat);
    }
}

const numberise = (val: string | number): number => {
    if (typeof(val) === "string") {
        return parseInt(val);
    } 
    return val;
}

export const NewValueStat = (/*name: string,*/ val: string | number) => {
    return {/*name: name, */type: "VALUE" as const, value: numberise(val)};
}

const rangeStat = (name: string, low: string|number, high: string|number) => {
    return {name: name, type: "RANGE" as const, low: numberise(low), high: numberise(high)};
}

const ProcessSValue = (level: number, stat: StatDefinition) => {

    const t = level/5+1;
    const sValue = stat.sValue!;
    if (sValue == "*XP") {
        return NewValueStat(/*stat.name, */level / 2 * 50);
    }
    else {
        let valueMin = 0;
        let valueMax = 0;
        if (sValue.includes(",")) {
            const sValueParts = sValue.split(',');
            for (let i = 0; i < sValueParts.length; ++i) {
                var currentSegment = sValueParts[i];
                if (currentSegment.includes("(")) {
                    if (currentSegment.includes("(t)"))
                    {
                        currentSegment = currentSegment.replace("(t)", t.toString());
                    }
                    if (currentSegment.includes("(t-1)"))
                    {
                        currentSegment = currentSegment.replace("(t-1)", (t-1).toString());
                    }
                    if (currentSegment.includes("(t+1)"))
                    {
                        currentSegment = currentSegment.replace("(t+1)", (t+1).toString());
                    }
                    sValueParts[i] = currentSegment.replace("(v)", stat.value.toString());
                }
            }
            for (let index = 0; index < sValueParts.length; ++index) {
                const [low, high] = GetLowAndHighRolls(sValueParts[index]);
                valueMin += low;
                valueMax += high;
            }
        }
        else
        {
            let dice = sValue;
            if (dice.includes("("))
            {
                if (dice.includes("(t)"))
                    dice = dice.replace("(t)", t.toString());
                if (dice.includes("(t-1)"))
                {
                    dice = dice.replace("(t-1)", (t - 1).toString());
                }
                if (dice.includes("(t+1)"))
                {
                    dice = dice.replace("(t+1)", (t+1).toString());
                }
                dice = dice.replace("(v)", stat.value.toString());
            }
            const [low, high] = GetLowAndHighRolls(dice);
            valueMin += low;
            valueMax += high;
        }
        if (stat.boost) {
            valueMin = BoostStatValue(valueMin, stat.boost)
            valueMax = BoostStatValue(valueMax, stat.boost)
        }
        const finalValueMin = Constrain(stat, Math.min(valueMin, valueMax));
        const finalValueMax = Constrain(stat, Math.max(valueMin, valueMax));
        if (finalValueMin === finalValueMax) {
            return NewValueStat(finalValueMin);
        }

        return rangeStat(stat.name, finalValueMin, finalValueMax);
    }
}

const BoostStatValue = (v: number, boost: string | number): number => {

    let boostVal = numberise(boost);
    const mult = boostVal > 0 ? 0.25 : 0.2;
    return v += Math.ceil(v * mult * boostVal);
}

const Constrain = (stat: ExportStat, val: number): number => {

    return Math.min(stat.max, Math.max(stat.min, val))
}

const dieRegex = /(?<count>\d+)d?(?<dieSize>\d)?(?<modOp>[+-])?(?<mod>\d+)?/;

const GetLowAndHighRolls = (dice: string): [number, number] => {

    const result = dice.match(dieRegex);
    if (!result || !result.groups) {
        throw new Error(`Dice didn't match regex: ${dice}`);
    }
    const [count, dieSize, modOp, mod] = [result.groups["count"], result.groups["dieSize"], result.groups["modOp"], result.groups["mod"]];
    const countInt = parseInt(count);
    if (!dieSize && !modOp && !mod) {
        return [countInt, countInt];
    }
    const dieSizeInt = parseInt(dieSize);
    const high = countInt * dieSizeInt;
    if (!modOp && !mod) {
        return [countInt, high];
    }
    if (modOp && !mod) {
        throw new Error(`Dice had invalid state, mod operator present but no modifier: ${dice}`);
    }
    const modInt = parseInt(mod);
    switch (modOp) {
        case "+": return [countInt+modInt, high+modInt];
        case "-": return [countInt-modInt, high-modInt]
    }
    throw new Error("Should not be possible")
}