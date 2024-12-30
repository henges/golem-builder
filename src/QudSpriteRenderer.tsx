import { ComponentProps, useEffect, useMemo, useState } from "react"
import { Color, loadAndModifyImage } from "./helpers";
import { Image } from "@chakra-ui/react";
import { ExportRender } from "./ExportTypes";

const basePath = "assets/Textures/";

const parseColorString = (c: string) => {

    if (c.length != 7 || c[0] != '#') {
        throw new Error(`malformed color string ${c}`);
    }
    const cut = c.substring(1);
    const ret: Color = {
        r: parseInt(cut.slice(0, 2), 16),
        g: parseInt(cut.slice(2, 4), 16),
        b: parseInt(cut.slice(4, 6), 16),
        a: 255
    }
    return ret;
}

const formatColor = (c: Color) => {

    return `#${c.r.toString(16)}${c.g.toString(16)}${c.b.toString(16)}`
}

const qudColorMap = Object.entries({
    "r": "#a64a2e",
    "R": "#d74200",
    "o": "#f15f22",
    "O": "#e99f10",
    "w": "#98875f",
    "W": "#cfc041",
    "g": "#009403",
    "G": "#00c420",
    "b": "#0048bd",
    "B": "#0096ff",
    "c": "#40a4b9",
    "C": "#77bfcf",
    "m": "#b154cf",
    "M": "#da5bd6",
    "k": "#0f3b3a",
    "K": "#155352",
    "y": "#b1c9c3",
    "Y": "#ffffff"
}).reduce((agg: Record<string, Color>, [k,v]) => { 
    agg[k] = parseColorString(v);
    return agg;
},{});

const parseQudColourString = (mainColour: string, detailColour?: string): [Color, Color] => {

    let [_, main, detail] = mainColour?.match(/&(\w)(?:\^(\w))?/) || [undefined, "Y", "K"];
    [main, detail] = [main || "Y", detail || "K"];

    if (detailColour) {
        return [qudColorMap[main], qudColorMap[detailColour]]
    }
    return [qudColorMap[main], qudColorMap[detail]];
}

// use by sw_tortoise.bmp
const altDetailColor = parseColorString("#7B6529");

const isMainColor = (c: Color): boolean => {
    return c.r === c.b && 
        c.r === c.g && 
        c.r === 0 && 
        c.a == 255;
}

const isDetailColor = (c: Color): boolean => {
    return (c.r === c.b && 
        c.r === c.g && 
        c.r === 255 && 
        c.a == 255) || (
        c.r == altDetailColor.r &&
        c.g == altDetailColor.g &&
        c.b == altDetailColor.b &&
        c.a == 255
    );
}

export interface QudSpriteRendererProps extends ComponentProps<typeof Image> {
    sprite: ExportRender
}

export const QudSpriteRenderer = ({sprite, ...props}: QudSpriteRendererProps) => {

    const canvas = useMemo(() => {
        return document.createElement("canvas");
    }, []);

    const [currentImage, setCurrentImage] = useState<string>("");

    const getImageUrl = async (sprite: ExportRender) => {

        console.log(`Colour string for sprite ${sprite.tile}: main ${sprite.mainColour}, detail ${sprite.detailColour}`)
        const [main, detail] = parseQudColourString(sprite.mainColour, sprite.detailColour);
        console.log(`Resolved colours for sprite ${sprite.tile}: main ${formatColor(main)}, detail ${formatColor(detail)}`)
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