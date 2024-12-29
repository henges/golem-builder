import { Center, VStack, Text, HStack } from "@chakra-ui/react";
import { GolemSelections } from "./Types";
import { useMemo } from "react";
import { QudSpriteRenderer } from "./QudSpriteRenderer";
import { GolemBody } from "./ExportTypes";
import { DefaultQudObjectProperties, QudAttributes, QudPhysics, QudResistances } from "./qud-logic/QudTypes";
import { ProcessStat } from "./qud-logic/Stat";


export interface GolemDisplayProps {
    bodySelection?: GolemBody
}

export const GolemDisplay = ({bodySelection}: GolemDisplayProps) => {

    const computeStatsFromSelections = () => {
        if (!bodySelection) {
            return null;
        }
        const ret = DefaultQudObjectProperties();

        const level = bodySelection.body.stats.find(v => v.name === "Level");
        if (!level) {
            console.log(`No level for body selection ${bodySelection.body.id}`);
            return null;
        }
        const levelVal = parseInt(level.value);
        for (const stat of bodySelection.body.stats) {
            if (stat.name === "Level") {
                ret.physics.level = levelVal;
                continue;
            }
            const result = ProcessStat(levelVal, stat);
            switch (stat.name) {
                // TODO: there are more - check if we need them.
                case "Hitpoints": ret.physics.hp = result; break;
                case "AV": ret.physics.av = result; break;
                case "DV": ret.physics.av = result; break;
                case "Strength": ret.attributes.strength = result; break;
                case "Agility": ret.attributes.agility = result; break;
                case "Toughness": ret.attributes.toughness = result; break;
                case "Intelligence": ret.attributes.intelligence = result; break;
                case "Willpower": ret.attributes.willpower = result; break;
                case "Ego": ret.attributes.ego = result; break;
                case "Speed": ret.physics.quickness = result; break;
                case "MoveSpeed": ret.physics.moveSpeed = result; break;
                case "XP": ret.physics.xp = result; break;
                case "XPValue": ret.physics.xpValue = result; break;
                case "MA": ret.physics.ma = result; break;
                case "HeatResistance": ret.resistances.heat = result; break;
                case "ColdResistance": ret.resistances.cold = result; break;
                case "ElectricResistance": ret.resistances.electric = result; break;
                case "AcidResistance": ret.resistances.acid = result; break;
            }
        }
        console.log(ret);
        return ret;
    }

    const stats = useMemo(() => {
        return computeStatsFromSelections();
    }, [bodySelection]);

    const statDisplay = stats === null ? null : (
    <>
        <VStack>
            <Text>Level: {stats.physics.level}</Text>
            <HStack>
                <Text>Strength: {stats.attributes.strength}</Text>
                <Text>Agility: {stats.attributes.agility}</Text>
                <Text>Toughness: {stats.attributes.toughness}</Text>
            </HStack>
            <HStack>
                <Text>Intelligence: {stats.attributes.intelligence}</Text>
                <Text>Willpower: {stats.attributes.willpower}</Text>
                <Text>Ego: {stats.attributes.ego}</Text>
            </HStack>
        </VStack>
    </>)

    return (
        <Center>
            <VStack>
                <QudSpriteRenderer sprite={bodySelection?.body.render || {displayName: "", tile: "Creatures/sw_golem_oddity.png", mainColour: "Y", detailColour: "K"}} minH={"96px"}/>
                <Text>{bodySelection?.body.render.displayName || "golem oddity"}</Text>
                {statDisplay}
            </VStack>
        </Center>
    )
}