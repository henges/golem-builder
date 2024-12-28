import { Center, VStack } from "@chakra-ui/react";
import { GolemSelections } from "./Types";
import { useMemo } from "react";
import { QudSpriteRenderer } from "./QudSpriteRenderer";
import { GolemBody } from "./ExportTypes";


export interface GolemDisplayProps {
    bodySelection?: GolemBody
    selections: GolemSelections
}

type GolemAttributes = {
    level: number
    strength: Range
    agility: Range
    toughness: Range
    intelligence: Range
    willpower: Range
    ego: Range
    mutations: Mutation[]
    properties: string[]
}

type Range = {
    low: number
    high: number
}

type Mutation = {
    name: string
    level: number
    showLevel: boolean
}

export const GolemDisplay = ({selections, bodySelection}: GolemDisplayProps) => {

    const computeAttrsFromSelections = (s: GolemSelections) => {

        const baseAV = 10;
    }

    const attrs = useMemo(() => computeAttrsFromSelections(selections), [selections])

    return (
        <Center>
            <VStack>
                <QudSpriteRenderer sprite={bodySelection?.body.render || {displayName: "", tile: "Creatures/sw_golem_oddity.png", mainColour: "Y", detailColour: "K"}} minH={"96px"}/>
            </VStack>
        </Center>
    )
}