import { Center, Image, VStack } from "@chakra-ui/react";
import { GolemSelections } from "./Types";
import { useMemo } from "react";
import { QudSpriteRenderer } from "./QudSpriteRenderer";


export interface GolemDisplayProps {
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

export const GolemDisplay = ({selections}: GolemDisplayProps) => {

    const computeAttrsFromSelections = (s: GolemSelections) => {

        const baseAV = 10;
    }

    const attrs = useMemo(() => computeAttrsFromSelections(selections), [selections])

    return (
        <Center>
            <VStack>
                <QudSpriteRenderer img={selections.body?.image || "Creatures/sw_golem_oddity.png"} minH={"96px"}/>
            </VStack>
        </Center>
    )
}