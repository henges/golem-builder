import { ExportStat } from "../ExportTypes";

export const ProcessStat = (level: number, stat: ExportStat) => {

    switch (stat.type) {
        case "STATIC": return stat.value;
        case "SVALUE": return ProcessSValue(level, stat);
    }
}

const ProcessSValue = (level: number, stat: ExportStat) => {

    const t = level/5+1;
    const sValue = stat.sValue!;
    if (sValue == "*XP") {
        return (level / 2 * 50).toString();
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
            valueMin += high;
        }
        if (stat.boost) {
            const boostVal = parseInt(stat.boost);
            const mult = boostVal > 0 ? 0.25 : 0.2;
            valueMin += Math.ceil(valueMin * mult * boostVal);
            valueMax += Math.ceil(valueMax * mult * boostVal);
        }
        console.log(stat.min, stat.max);
        const finalValueMin = Constrain(stat, Math.min(valueMin, valueMax));
        const finalValueMax = Constrain(stat, Math.max(valueMin, valueMax));
        return `${finalValueMin}-${finalValueMax}`;
    }
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