import { VStack, Text, HStack, Grid } from "@chakra-ui/react";
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

    const [bodySelection, catalystSelection, atzmusSelection, weaponSelection, incantationSelection, hamsaSelection] = useGolemStore(useShallow(s => 
        [s.bodySelection, s.catalystSelection, s.atzmusSelection, s.weaponSelection, s.incantationSelection, s.hamsaSelection]));

    const computeStatsFromSelections = (b: GolemBody, catalyst: GameObjectUnit[], atzmus: ConditionalGameObjectUnitGroup, weapon: GameObjectUnit[], incantation: GameObjectUnit[], hamsa: ConditionalGameObjectUnitGroup) => {
        const ret = ComputeQudObjectProperties(b.body);
        ApplyGolemBodySelection(ret);
        ApplyStandardModifiers(ret);
        ApplyGameObjectUnits(ret, catalyst);
        ApplyConditionalGameObjectUnits(ret, atzmus);
        ApplyGameObjectUnits(ret, weapon);
        ApplyGameObjectUnits(ret, incantation);
        ApplyConditionalGameObjectUnits(ret, hamsa);
        return ret;
    }

    const stats = useMemo(() => {
        if (!bodySelection) {
            return null;
        }
        return computeStatsFromSelections(bodySelection, catalystSelection, atzmusSelection, weaponSelection, incantationSelection, hamsaSelection);
    }, [bodySelection, catalystSelection, atzmusSelection, weaponSelection, incantationSelection, hamsaSelection]);

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
            <Grid templateColumns={"repeat(3, 1fr)"} templateRows={"repeat(2, 1fr)"} textAlign={"left"}>
            {/* <HStack> */}
                <Text>♥ HP: {FormatStat(stats.physics.hp)}</Text>
                {/* <Text>♥ HP: {FormatStat(stats.physics.hp)}</Text> */}
                <Text>◆ AV: {FormatStat(stats.physics.av)}</Text>
                <Text>○ DV: {FormatStat(stats.physics.dv)}</Text>
                <Text>MA: {FormatStat(stats.physics.ma)}</Text>
                <Text>QN: {FormatStat(stats.physics.quickness)}</Text>
                <Text>MV: {FormatMoveSpeed(stats.physics.moveSpeed)}</Text>
            {/* </HStack> */}
            </Grid>
            <HStack>
                <Text>STR: {FormatStat(stats.attributes.strength)}</Text>
                <Text>AGI: {FormatStat(stats.attributes.agility)}</Text>
                <Text>TOU: {FormatStat(stats.attributes.toughness)}</Text>
            </HStack>
            <HStack>
                <Text>INT: {FormatStat(stats.attributes.intelligence)}</Text>
                <Text>WIL: {FormatStat(stats.attributes.willpower)}</Text>
                <Text>EGO: {FormatStat(stats.attributes.ego)}</Text>
            </HStack>
            <HStack>
                <Text>HR: {FormatStat(stats.resistances.heat)}</Text>
                <Text>CR: {FormatStat(stats.resistances.cold)}</Text>
            </HStack>
            <HStack>
                <Text>AR: {FormatStat(stats.resistances.acid)}</Text>
                <Text>ER: {FormatStat(stats.resistances.electric)}</Text>
            </HStack>
        </VStack>
    </>)

    return (
        <VStack width="100%" p={2} overflow="auto">
            <QudSpriteRenderer sprite={getBodyRender()} minH={"96px"}/>
            <Text>{getBodyRender().displayName}</Text>
            {statDisplay}
            {GetBodySpecialPropertiesElement(stats || undefined)}
            <GolemVariantSelection/>
        </VStack>
    )
}