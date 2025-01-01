import { Center, VStack, Text, HStack } from "@chakra-ui/react";
import { useMemo } from "react";
import { QudSpriteRenderer } from "./QudSpriteRenderer";
import { FormatMoveSpeed, FormatStat } from "./qud-logic/Stat";
import { ApplyConditionalGameObjectUnits, ApplyGameObjectUnits, ApplyGolemBodySelection, ApplyStandardModifiers, ComputeQudObjectProperties, GetBodySpecialPropertiesElement } from "./qud-logic/Properties";
import { useGolemStore } from "./stores/GolemStore";
import { useShallow } from "zustand/shallow";
import { GolemBody } from "./ExportTypes";
import { GolemVariantSelection } from "./GolemVariantSelection";
import { ConditionalGameObjectUnitGroup, GameObjectUnit } from "./qud-logic/GameObjectUnit";

export const GolemDisplay = () => {

    const [bodySelection, catalystSelection, atzmusSelection, weaponSelection] = useGolemStore(useShallow(s => [s.bodySelection, s.catalystSelection, s.atzmusSelection, s.weaponSelection]));

    const computeStatsFromSelections = (b: GolemBody, catalyst: GameObjectUnit[], atzmus: ConditionalGameObjectUnitGroup, weapon: GameObjectUnit[]) => {
        const ret = ComputeQudObjectProperties(b.body);
        ApplyGolemBodySelection(ret);
        ApplyStandardModifiers(ret);
        ApplyGameObjectUnits(ret, catalyst);
        ApplyConditionalGameObjectUnits(ret, atzmus);
        ApplyGameObjectUnits(ret, weapon);
        return ret;
    }

    const stats = useMemo(() => {
        if (!bodySelection) {
            return null;
        }
        return computeStatsFromSelections(bodySelection, catalystSelection, atzmusSelection, weaponSelection);
    }, [bodySelection, catalystSelection, atzmusSelection, weaponSelection]);

    const getBodyRender = () => {
        if (bodySelection) {
            return bodySelection.body.render
        }
        return {displayName: "golem oddity", tile: "Creatures/sw_golem_oddity.png", mainColour: "Y", detailColour: "K"};
    }

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
                <Text>MA: {FormatStat(stats.physics.ma)}</Text>
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
            <HStack>
                <Text>Heat Resist: {FormatStat(stats.resistances.heat)}</Text>
                <Text>Cold Resist: {FormatStat(stats.resistances.cold)}</Text>
            </HStack>
            <HStack>
                <Text>Acid Resist: {FormatStat(stats.resistances.acid)}</Text>
                <Text>Electric Resist: {FormatStat(stats.resistances.electric)}</Text>
            </HStack>
        </VStack>
    </>)

    return (
        <Center width="100%">
            <VStack>
                <QudSpriteRenderer sprite={getBodyRender()} minH={"96px"}/>
                <Text>{getBodyRender().displayName}</Text>
                {statDisplay}
                {GetBodySpecialPropertiesElement(stats || undefined)}
                <GolemVariantSelection/>
            </VStack>
        </Center>
    )
}