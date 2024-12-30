import { ComponentProps, useEffect, useMemo, useState } from "react"
import { loadAndModifyImage } from "./helpers";
import { Image } from "@chakra-ui/react";
import { ExportRender } from "./ExportTypes";
import { parseQudColourString, formatColor, isMainColor, isDetailColor } from "./Colours";

const basePath = "assets/Textures/";

export interface QudSpriteRendererProps extends ComponentProps<typeof Image> {
    sprite: ExportRender
}

export const QudSpriteRenderer = ({sprite, ...props}: QudSpriteRendererProps) => {

    const canvas = useMemo(() => {
        return document.createElement("canvas");
    }, []);

    const [currentImage, setCurrentImage] = useState<string>("");

    const getImageUrl = async (sprite: ExportRender) => {

        // console.log(`Colour string for sprite ${sprite.tile}: main ${sprite.mainColour}, detail ${sprite.detailColour}`)
        const [main, detail] = parseQudColourString(sprite.mainColour, sprite.detailColour);
        // console.log(`Resolved colours for sprite ${sprite.tile}: main ${formatColor(main)}, detail ${formatColor(detail)}`)
        return await loadAndModifyImage(basePath+sprite.tile, (c) => {
            if (isMainColor(c)) {
                return main;
            } else if (isDetailColor(c)) {
                return detail;
            }
            return {r: 32, g: 32, b: 32, a: 0}
        }, canvas);
    }

    useEffect(() => {
        let cancelled = false;

        getImageUrl(sprite).then((url) => {if (!cancelled) {setCurrentImage(url)}});
        return () => {cancelled = true;}
    }, [sprite]);

    return <Image src={currentImage} imageRendering={"pixelated"} {...props}/>
    
}