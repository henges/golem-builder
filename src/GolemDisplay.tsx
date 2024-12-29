import { Center, VStack, Text, HStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { QudSpriteRenderer } from "./QudSpriteRenderer";
import { GolemBody } from "./ExportTypes";
import { FormatMoveSpeed, FormatStat } from "./qud-logic/Stat";
import { ApplyGolemBodySelection, ComputeQudObjectProperties, GetBodySpecialPropertiesElement } from "./qud-logic/Properties";


export interface GolemDisplayProps {
    bodySelection?: GolemBody
}

export const GolemDisplay = ({bodySelection}: GolemDisplayProps) => {

    const computeStatsFromSelections = () => {
        if (!bodySelection) {
            return null;
        }
        const ret = ComputeQudObjectProperties(bodySelection.body);
        ApplyGolemBodySelection(ret);
        return ret;
    }

    const stats = useMemo(() => {
        return computeStatsFromSelections();
    }, [bodySelection]);

    const statDisplay = stats === null ? null : (
    <>
        <VStack>
            <Text>Level: {FormatStat(stats.physics.level)}</Text>
            <HStack>
                <Text>♥ HP: {FormatStat(stats.physics.hp)}</Text>
                <Text>◆ AV: {FormatStat(stats.physics.av)}</Text>
                <Text>○ DV: {FormatStat(stats.physics.dv)}</Text>
                <Text>QN: {FormatStat(stats.physics.quickness)}</Text>
                <Text>MV: {FormatMoveSpeed(stats.physics.moveSpeed)}</Text>
                </HStack>
            <HStack>
                <Text>Strength: {FormatStat(stats.attributes.strength)}</Text>
                <Text>Agility: {FormatStat(stats.attributes.agility)}</Text>
                <Text>Toughness: {FormatStat(stats.attributes.toughness)}</Text>
            </HStack>
            <HStack>
                <Text>Intelligence: {FormatStat(stats.attributes.intelligence)}</Text>
                <Text>Willpower: {FormatStat(stats.attributes.willpower)}</Text>
                <Text>Ego: {FormatStat(stats.attributes.ego)}</Text>
            </HStack>
        </VStack>
    </>)

    return (
        <Center>
            <VStack>
                <QudSpriteRenderer sprite={bodySelection?.body.render || {displayName: "", tile: "Creatures/sw_golem_oddity.png", mainColour: "Y", detailColour: "K"}} minH={"96px"}/>
                <Text>{bodySelection?.body.render.displayName || "golem oddity"}</Text>
                {statDisplay}
                {GetBodySpecialPropertiesElement(bodySelection)}
            </VStack>
        </Center>
    )
}