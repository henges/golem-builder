import { ComponentProps, useEffect, useMemo, useState } from "react"
import { modifyImage } from "./helpers";
import { Image } from "@chakra-ui/react";
import { ExportRender } from "./ExportTypes";
import { parseQudColourString, isMainColor, isDetailColor } from "./Colours";
import { useImageStore } from "./stores/ImageStore";
import { useShallow } from "zustand/shallow";

export interface QudSpriteRendererProps extends ComponentProps<typeof Image> {
    sprite: ExportRender
}

export const QudSpriteRenderer = ({sprite, ...props}: QudSpriteRendererProps) => {

    const canvas = useMemo(() => {
        return document.createElement("canvas");
    }, []);

    const getImageData = useImageStore(useShallow(s => s.getImageData));

    const [currentImage, setCurrentImage] = useState<string>("");

    const getImageUrl = async (sprite: ExportRender) => {

        const perfId = `render-${sprite.tile}-${Math.floor(Math.random()*1000)}`;
        console.time(perfId)

        // console.log(`Colour string for sprite ${sprite.tile}: main ${sprite.mainColour}, detail ${sprite.detailColour}`)
        const [main, detail] = parseQudColourString(sprite.mainColour, sprite.detailColour);
        // console.log(`Resolved colours for sprite ${sprite.tile}: main ${formatColor(main)}, detail ${formatColor(detail)}`)
        const imgData = await getImageData(sprite.tile);

        const res = await modifyImage(imgData, canvas, (c) => {
            if (isMainColor(c)) {
                return main;
            } else if (isDetailColor(c)) {
                return detail;
            }
            return {r: 32, g: 32, b: 32, a: 0}
        });

        console.timeEnd(perfId);
        return res;
    }

    useEffect(() => {
        let cancelled = false;

        getImageUrl(sprite).then((url) => {if (!cancelled) {setCurrentImage(url)}});
        return () => {cancelled = true;}
    }, [sprite]);

    return <Image src={currentImage} minH="24px" minW="16px" imageRendering={"pixelated"} {...props}/>
    
}