import { Box, Text } from "@chakra-ui/react";
import { ExportMutation, GolemBody } from "../ExportTypes";

const BodyHasSpecialProperties = (g: GolemBody) => {
    return g.body.mutations.length > 0 || g.body.skills.length > 0 || g.body.flags.mentalShield;
}

export const GetBodySpecialProperties = (g: GolemBody) => {

    const ret: string[] = [];
    ret.push(...g.body.mutations.map(m => `${m.name}${m.showLevel && m.level ? ` ${m.level}` : ""}`));
    ret.push(...g.body.skills);
    if (g.body.flags.mentalShield) {
        ret.push("Mental shield");
    }
    return ret;
}

const FormatMutation = (m: ExportMutation) => {
    return `${m.name}${m.showLevel && m.level ? ` ${m.level}` : ""}`;
}

export const GetBodySpecialPropertiesElement = (g: GolemBody) => {

    if (!BodyHasSpecialProperties(g)) {
        return null;
    }
    return (
    <Box>
        {/* {g.body.mutations.length === 0 ? null : g.body.mutations.map(m => {<Text>{FormatMutation(m)}</Text>})} */}
        {g.body.mutations.length === 0 ? null : 
            <Text>Mutations: {g.body.mutations.map(m => FormatMutation(m)).join(", ")}</Text>
        }
        {g.body.skills.length === 0 ? null : 
            <Text>Skills: {g.body.skills.join(", ")}</Text>
        }
        {!g.body.flags.mentalShield ? null : 
            <Text>Has a mental shield</Text>
        }
    </Box>
    )
}