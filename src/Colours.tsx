import React from "react";
import {Text} from '@chakra-ui/react';

export type Color = {
    r: number;
    g: number;
    b: number;
    a: number;
};

export const parseColorString = (c: string) => {

    if (c.length !== 7 || c[0] !== '#') {
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

export const formatColor = (c: Color) => {

    return `#${c.r.toString(16)}${c.g.toString(16)}${c.b.toString(16)}`
}

export const qudHexColorMap: Record<string, string> = {
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
};

export const qudColorMap = Object.entries(qudHexColorMap).reduce((agg: Record<string, Color>, [k,v]) => { 
    agg[k] = parseColorString(v);
    return agg;
},{});

export const parseQudColourString = (mainColour: string, detailColour?: string): [Color, Color] => {

    let [_, main, detail] = mainColour?.match(/&(\w)(?:\^(\w))?/) || [undefined, "Y", "K"];
    [main, detail] = [main || "Y", detail || "K"];

    if (detailColour) {
        return [qudColorMap[main], qudColorMap[detailColour]]
    }
    return [qudColorMap[main], qudColorMap[detail]];
}

// use by sw_tortoise.bmp
const altDetailColor = parseColorString("#7B6529");

export const isMainColor = (c: Color): boolean => {
    return c.r === c.b && 
        c.r === c.g && 
        c.r === 0 && 
        c.a === 255;
}

export const isDetailColor = (c: Color): boolean => {
    return (c.r === c.b && 
        c.r === c.g && 
        c.r === 255 && 
        c.a === 255) || (
        c.r === altDetailColor.r &&
        c.g === altDetailColor.g &&
        c.b === altDetailColor.b &&
        c.a === 255
    );
}

export const applyQudShader = (s: string): React.ReactNode => {

    const markup = parseMarkup(s);
    return applyMarkup(markup);
}

export const applyMarkup = (root: MarkupControlNode): React.ReactNode => {

    return root.children.map(n => applyMarkupInner(n, null)).flat(20);
}

const applyMarkupInner = (node: MarkupNode, action: string | null): React.ReactNode => {

    switch (node.type) {
        case "TEXT": {
            if (action !== null) {
                return [applyAction(node.text, action)];
            }
            return [node.text];
        }
        case "CONTROL": {
            return node.children.map(n => applyMarkupInner(n, node.action))
        }
    }
}

const applyAction = (text: string, action: string) => {
    const act = qudHexColorMap[action];
    if (!act){
        console.log(`No matching action found for ${action}`);
        return text;
    }
    return <Text as="span" color={act}>{text}</Text>
}

export const parseMarkup = (s: string) => {

    const rootNode = newMarkupControlNode();
    rootNode.action = "BEGIN";
    let pos = 0;
    parseText(s, pos, rootNode);
    return rootNode;
}

type MarkupNode = MarkupTextNode | MarkupControlNode;

type MarkupControlNode = {
    type: "CONTROL"
    action: string | null
    children: MarkupNode[]
}

const newMarkupControlNode = (): MarkupControlNode => {
    return {
        type: "CONTROL" as const,
        action: null,
        children: []
    }
}

type MarkupTextNode = {
    type: "TEXT"
    text: string
}

const newMarkupTextNode = (s: string) => {
    return {
        type: "TEXT" as const,
        text: s
    }
}


const parseText = (text: string, pos: number, parent: MarkupControlNode) => {
  let startIndex = pos;
  while (pos < text.length)
  {
    if (text[pos] === '{' && pos < text.length - 1 && text[pos + 1] === '{')
    {
      if (pos > startIndex)
        parent.children.push(newMarkupTextNode(text.substring(startIndex, pos/* - startIndex*/)));
      pos += 2;
      pos = parseControl(text, pos, parent);
      startIndex = pos;
    }
    else
      ++pos;
  }
  if (pos <= startIndex)
    return pos;
  parent.children.push(newMarkupTextNode(text.substring(startIndex, pos/* - startIndex*/)));
  return pos;
}

const parseControl = (text: string, pos: number, parent: MarkupControlNode) => {
    let startIndex = pos;
    let markupControlNode = newMarkupControlNode();
    while (pos < text.length) {
        let ch = text[pos];
        if (ch === '|' && markupControlNode.action === null)
        {
            markupControlNode.action = pos > startIndex ? text.substring(startIndex, pos/* - startIndex*/) : "";
            ++pos;
            startIndex = pos;
        }
        else
        {
            if (ch === '}' && pos < text.length - 1 && text[pos + 1] === '}')
            {
                if (markupControlNode.action !== null) {
                    markupControlNode.children.push(newMarkupTextNode(text.substring(startIndex, pos/* - startIndex*/)));
                }
                pos += 2;
                startIndex = pos;
                break;
            }
            if (ch === '{' && pos < text.length - 1 && text[pos + 1] === '{')
            {
                if (markupControlNode.action === null) {
                    markupControlNode.action = "";
                }
                if (pos > startIndex) {
                    markupControlNode.children.push(newMarkupTextNode(text.substring(startIndex, pos/* - startIndex*/)));
                }
                pos += 2;
                pos = parseControl(text, pos, markupControlNode);
                startIndex = pos;
            }
            else {
                ++pos;
            }
        }
    }
    if (pos > startIndex) {
        markupControlNode.children.push(newMarkupTextNode(text.substring(startIndex, pos/* - startIndex*/)));
    }
    if (markupControlNode.children.length <= 0) {
        return pos;
    }
    parent.children.push(markupControlNode);
    return pos;
} 