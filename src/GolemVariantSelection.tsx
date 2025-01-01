import { useShallow } from "zustand/shallow";
import { useGolemStore } from "./stores/GolemStore";
import { ExportObject, GolemBody } from "./ExportTypes";
import { VStack, Grid, GridItem } from "@chakra-ui/react";
import { QudSpriteRenderer } from "./QudSpriteRenderer";
import { Tooltip } from "./components/ui/tooltip";
import { applyQudShader } from "./Colours";
import { Pluralise } from "./helpers";


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
        return Object.entries(limbCountMap).sort(([k1], [k2]) => k1.localeCompare(k2)).map(([k,v]) => `${v} ${Pluralise(k,v)}`).join(", ");
    }

    const exportObjectToDisplay = (prov: ExportObject) => {
        return  <Tooltip content={applyQudShader(prov.render.displayName)} openDelay={100} closeDelay={100}>
            <QudSpriteRenderer w="16px" h="24px" display={"inline"} sprite={prov.render}/>
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

    const dedupe = <T,>(array: T[], sel: (e: T) => string) => {
        const seenVals: Record<string, boolean> = {};
        const ret = [];
        for (const el of array) {
            const key = sel(el);
            if (!seenVals[key]) {
                seenVals[key] = true;
                ret.push(el);
            }
        }
        return ret;
    }

    const invalidSelections = [
        "troll",
        "troll king",
        "{{g|spitting plant}}",
        "baboon hero",
        "cragmensch",
        "glittermensch",
        "dromad",
        "goatfolk",
        "turret tinker",
        "Rainwater Shomer",
        "holographic beth",
        "{{Y|holographic ivory}}",
        "snapjaw",
        "girshling",
        "{{B|liquidlichen}}",
        "breathbeard",
        "elder breathbeard",
    ].reduce((agg: Record<string, boolean>, e) => {
        agg[e] = true;
        return agg;
    }, {})

    const filterAndDeduplicateInvalidSelections = (providers: ExportObject[]) => {

        return dedupe(providers.filter(o => !o.render.displayName.startsWith("[") && !invalidSelections[o.render.displayName]), o => o.render.displayName);
    }

    const singlePatternDisplay = (p: string[], providers: ExportObject[]) => {

        return (
            <VStack>
                {parseLimbPattern(p)}
                {chunkArray(filterAndDeduplicateInvalidSelections(providers), 4).map(modelRow)}
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
        } else {
            const patternToModels = Object.entries(b.patternMap).reduce((agg: ExportObject[][], [k,v]) => {
                const model = b.models.find(e => e.id === k);
                if (!model) {
                    throw new Error("No model found");
                }
                agg[v].push(model);
                return agg;
            }, b.patterns.map(_ => [])); // create a 2d array with same length as # of patterns
            return <Grid templateColumns="repeat(2, 1fr)" gap="8">
                {b.patterns.map((p, i) => <GridItem>{singlePatternDisplay(p, patternToModels[i])}</GridItem>)}
            </Grid>
        }
    }

    return <>
        {!bodySelection ? null : bodyTypeDisplay(bodySelection)}
    </>
}