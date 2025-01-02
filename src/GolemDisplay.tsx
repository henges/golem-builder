import { VStack, Text, Center, useBreakpointValue, Table, Box } from "@chakra-ui/react";
import { useMemo } from "react";
import { QudSpriteRenderer } from "./QudSpriteRenderer";
import { FormatMoveSpeed, FormatStat } from "./qud-logic/Stat";
import { ApplyConditionalGameObjectUnits, ApplyGameObjectUnits, ApplyGolemBodySelection, ApplyStandardModifiers, ApplyVariant, ComputeQudObjectProperties, GetBodySpecialPropertiesElement } from "./qud-logic/Properties";
import { useGolemStore } from "./stores/GolemStore";
import { useShallow } from "zustand/shallow";
import { GolemBody } from "./ExportTypes";
import { GolemVariantSelection } from "./GolemVariantSelection";
import { ConditionalGameObjectUnitGroup, GameObjectUnit } from "./qud-logic/GameObjectUnit";
import { QudObjectProperties } from "./qud-logic/QudTypes";

export const GolemDisplay = () => {

    const [bodySelection, bodyVariant, catalystSelection, atzmusSelection, weaponSelection, incantationSelection, hamsaSelection] = useGolemStore(useShallow(s => 
        [s.bodySelection, s.bodyVariant, s.catalystSelection, s.atzmusSelection, s.weaponSelection, s.incantationSelection, s.hamsaSelection]));

    const computeStatsFromSelections = (b: GolemBody, variant: string[], catalyst: GameObjectUnit[], atzmus: ConditionalGameObjectUnitGroup, weapon: GameObjectUnit[], incantation: GameObjectUnit[], hamsa: ConditionalGameObjectUnitGroup) => {
        const ret = ComputeQudObjectProperties(b.body);
        ApplyGolemBodySelection(ret);
        ApplyStandardModifiers(ret);
        ApplyVariant(ret, variant);
        ApplyGameObjectUnits(ret, catalyst);
        ApplyConditionalGameObjectUnits(ret, atzmus);
        ApplyGameObjectUnits(ret, weapon);
        ApplyGameObjectUnits(ret, incantation);
        ApplyConditionalGameObjectUnits(ret, hamsa);
        return ret;
    }
    const smallScreen = useBreakpointValue({ base: true, md: false });

    const stats = useMemo(() => {
        if (!bodySelection) {
            return null;
        }
        return computeStatsFromSelections(bodySelection, bodyVariant, catalystSelection, atzmusSelection, weaponSelection, incantationSelection, hamsaSelection);
    }, [bodySelection, bodyVariant, catalystSelection, atzmusSelection, weaponSelection, incantationSelection, hamsaSelection]);

    const getBodyRender = () => {
        if (bodySelection) {
            return bodySelection.body.render
        }
        return {displayName: "golem oddity", tile: "Creatures/sw_golem_oddity.png", mainColour: "Y", detailColour: "K"};
    }

    type TableElement = {
        icon?: string
        cellColour?: string
        name: string
        value: string
    }

    const physicsTableData = (stats: QudObjectProperties): TableElement[][] => {

        const data = [
            {icon: "♥", name: "HP", value: FormatStat(stats.physics.hp)},
            {icon: "◆", name: "AV", value: FormatStat(stats.physics.av)},
            {icon: "○", name: "DV", value: FormatStat(stats.physics.dv)},
            {name: "MA", value: FormatStat(stats.physics.ma)},
            {name: "QN", value: FormatStat(stats.physics.quickness)},
            {name: "MV", value: FormatMoveSpeed(stats.physics.moveSpeed)}
        ]

        return [
            [data[0], data[1]],
            [data[2], data[3]], 
            [data[4], data[5]],
        ]
    }

    const attrsTableData = (stats: QudObjectProperties) => {
        const data = [
            {name: "STR", value: FormatStat(stats.attributes.strength)},
            {name: "AGI", value: FormatStat(stats.attributes.agility)},
            {name: "TOU", value: FormatStat(stats.attributes.toughness)},
            {name: "INT", value: FormatStat(stats.attributes.intelligence)},
            {name: "WIL", value: FormatStat(stats.attributes.willpower)},
            {name: "EGO", value: FormatStat(stats.attributes.ego)},
        ];

        return [
            [data[0], data[1]],
            [data[2], data[3]], 
            [data[4], data[5]],
        ];
    }

    const resistsTableData = (stats: QudObjectProperties) => {
        const data = [
            {name: "HR", value: FormatStat(stats.resistances.heat)},
            {name: "CR", value: FormatStat(stats.resistances.cold)},
            {name: "AR", value: FormatStat(stats.resistances.acid)},
            {name: "ER", value: FormatStat(stats.resistances.electric)},
        ];

        return [
            [data[0], data[1]],
            [data[2], data[3]], 
        ];
    }

    const StatsTable = ({data}: {data: TableElement[][]}) => {

        return (
            <Table.Root size="sm" showColumnBorder striped>
                <Table.Body>
                    {data.map((row, i) => (
                    <Table.Row key={i} >
                        {row.map(elem => (
                            <>
                            <Table.Cell textAlign={"right"}>{elem.icon ? elem.icon+" ":""}{elem.name}</Table.Cell>
                            <Table.Cell textAlign={"center"}>{elem.value}</Table.Cell>
                            </>
                        ))}
                    </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        );
    }

    const statDisplay = stats === null ? null : (
    <>
        <VStack>
            <Text>Level: {FormatStat(stats.physics.level)}</Text>
            <Box display="flex" flexDir={"column"} gap={4}>
                <StatsTable data={physicsTableData(stats)}></StatsTable>
                <StatsTable data={attrsTableData(stats)}></StatsTable>
                <StatsTable data={resistsTableData(stats)}></StatsTable>
            </Box>
        </VStack>
    </>)

    return (
        <VStack width="100%" p={2} overflow="auto">
            <QudSpriteRenderer sprite={getBodyRender()} minH={"96px"}/>
            <Text>{getBodyRender().displayName}</Text>
            {statDisplay}
            <Center textAlign={"center"} paddingX={smallScreen ? "" : "16"}>
                {GetBodySpecialPropertiesElement(stats || undefined)}
            </Center>
            <GolemVariantSelection/>
        </VStack>
    )
}