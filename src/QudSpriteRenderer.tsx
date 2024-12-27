import { ComponentProps, useEffect, useMemo, useState } from "react"
import { Color, loadAndModifyImage } from "./helpers";
import { Image } from "@chakra-ui/react";

const basePath = "assets/Textures/";

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

const parseColorString = (c: string) => {

    if (c.length != 7 || c[0] != '#') {
        throw new Error(`malformed color string ${c}`);
    }
    const cut = c.substring(1);
    const ret: Color = {
        r: parseInt(cut.slice(0, 2)),
        g: parseInt(cut.slice(2, 4)),
        b: parseInt(cut.slice(4, 6)),
        a: 255
    }
    return ret;
}

const isMainColor = (c: Color): boolean => {
    return c.r === c.b && c.r === c.g && c.r === 0 && c.a == 255;
}

const isDetailColor = (c: Color): boolean => {
    return c.r === c.b && c.r === c.g && c.r === 255 && c.a == 255;
}

export interface QudSpriteRendererProps extends ComponentProps<typeof Image> {
    img: string
}

export const QudSpriteRenderer = ({img, ...props}: QudSpriteRendererProps) => {

    const canvas = useMemo(() => {
        return document.createElement("canvas");
    }, []);

    const [currentImage, setCurrentImage] = useState<string>("");

    const setImage = async (path: string) => {

        const url = await loadAndModifyImage(basePath+path, (c) => {
            if (isMainColor(c)) {
                return {r: 255, g: 255, b: 255, a: 255}
            } else if (isDetailColor(c)) {
                return {r: 0, g: 0, b: 0, a: 255}
            }
            return {r: 128, g: 128, b: 128, a: 255}
        }, canvas);
        setCurrentImage(url);
    }

    useEffect(() => {
        setImage(img);
    }, [img]);

    return <Image src={currentImage} imageRendering={"pixelated"} {...props}/>
    
}