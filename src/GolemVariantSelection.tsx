import { useShallow } from "zustand/shallow";
import { useGolemStore } from "./stores/GolemStore";
import { ExportObject, GolemBody } from "./ExportTypes";
import { Box, VStack, Text, Grid } from "@chakra-ui/react";
import { QudSpriteRenderer } from "./QudSpriteRenderer";
import { Tooltip } from "./components/ui/tooltip";

export const GolemVariantSelection = () => {

    const [bodySelection] = useGolemStore(useShallow(s => [s.bodySelection]));

    const parseLimbPattern = (p: string[]) => {
        if (p.length === 1 && p[0] === "*RANDOM*") {
            return "All limbs of 1 random limb type";
        }
        const limbCountMap = p.reduce((agg: Record<string, number>, k) => {
            if (agg[k]) {
                agg[k] += 1;
            } else {
                agg[k] = 1;
            }
            return agg;
        }, {})
        return Object.entries(limbCountMap).sort(([k1], [k2]) => k1.localeCompare(k2)).map(([k,v]) => `${v} ${k}${v>1?"s":""}`).join("\n");
    }

    const exportObjectToDisplay = (prov: ExportObject) => {
        return  <Tooltip content={prov.render.displayName} openDelay={100} closeDelay={100}>
            <QudSpriteRenderer w="16px" h="32px" display={"inline"} sprite={prov.render}/>
        </Tooltip>
    }

    const chunkArray = <T,>(a: T[], size: number): T[][] => {

        const ret = [];
        let curArray: T[] = [];
        for (let i = 0; i < a.length; i++) {
            if (i%size===0) {
                ret.push(curArray);
                curArray = [];
            }
            curArray.push(a[i]);
        }
        ret.push(curArray);
        return ret;
    }

    const modelRow = (providers: ExportObject[]) => {

        return <Grid templateColumns={`repeat(${providers.length}, 1fr)`} gap="4">
            {providers.map(prov => exportObjectToDisplay(prov))}
        </Grid>
    }

    const singlePatternDisplay = (p: string[], providers: ExportObject[]) => {

        return (
            <VStack>
                {parseLimbPattern(p)}
                {chunkArray(providers, 4).map(modelRow)}
            </VStack>
        )
    }

    const bodyTypeDisplay = (b: GolemBody) => {

        if (b.patterns.length === 1) {

            return (
                <VStack>
                    {singlePatternDisplay(b.patterns[0], b.models)}
                </VStack>
            )
        }

        return null;
    }

    return <>
        {!bodySelection ? null : bodyTypeDisplay(bodySelection)}
    </>
}