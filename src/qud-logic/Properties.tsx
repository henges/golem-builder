import { Box, Text } from "@chakra-ui/react";
import { GolemBody, GolemData } from "../ExportTypes";

export const GetBodySpecialProperties = (g: GolemBody) => {

    const ret: string[] = [];
    ret.push(...g.body.mutations.map(m => `${m.name}${m.showLevel && m.level ? ` ${m.level}` : ""}`));
    ret.push(...g.body.skills);
    if (g.body.flags.mentalShield) {
        ret.push("Mental shield");
    }
    return ret;
}

export const GetBodySpecialPropertiesElement = (g: GolemBody) => {

    const props = GetBodySpecialProperties(g);
    if (props.length === 0) {
        return null;
    }
    return (
    <Box>
        {props.length && <Text as="span">{props.join(", ")}</Text>}
    </Box>
    )
}