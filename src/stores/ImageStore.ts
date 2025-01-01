import { create } from "zustand"

type Spritemap = Record<string, {x: number, y: number}>;

export interface ImageStore {
    spritesheet: HTMLImageElement | null
    spritemap: Spritemap
    canvas: HTMLCanvasElement | null
    ready: boolean
    data: Uint8ClampedArray
    width: number
    height: number
    getImageData: (s: string) => Promise<ImageData>
}

const load = async () => {

    const getImage = async () => {
        const image = new Image();
        image.src = "assets/spritesheet.png";
    
        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
        });
        return image;
    }

    const getSpritemap = async () => {

        const resp = await fetch("assets/spritemap.json");
        return await resp.json() as Spritemap;
    }

    return await Promise.all([getImage(), getSpritemap()])
}

const [spriteX, spriteY] = [16, 24];

const getImageDataQuick = (x: number, y: number, outWidth: number, outHeight: number, width:number, d: Uint8ClampedArray) => {
	var arr = new Uint8ClampedArray(outWidth*outHeight*4);
    let bufIdx = 0;
    const yMax = outHeight+y;
    const xMax = outWidth+x;
    for (let j = y; j < yMax; j++) {
        for (let i = x; i < xMax; i++) {
            let pos = (j * width + i) * 4; // Correct position calculation
            for (let w = 0; w < 4; w++) {
                arr[bufIdx++] = d[pos++];
            }
        }
    }

	return arr;
};

export const useImageStore = create<ImageStore>((set, get) => {
    
    const prom = load().then(([img, map]) => {

        const canvas = document.createElement("canvas");
        canvas.height = img.height;
        canvas.width = img.width;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("failed to create canvas context")
        }
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        
        set({spritemap: map, spritesheet: img, canvas: canvas, width: canvas.width, height: canvas.height, ready: true, data: data})
    });

    return {
        spritemap: {},
        spritesheet: null,
        canvas: null,
        ready: false,
        data: new Uint8ClampedArray(0),
        width: 0,
        height: 0,
        getImageData: async (s: string) => {
            await prom;

            const {spritemap, data, width} = get();
            // if (!ready || spritemap === null || canvas === null) {
            //     return null;
            // }
            if (!spritemap[s]) {
                throw new Error(`no spritemap entry for sprite ${s}`)
            }
            const {x, y} = spritemap[s];
            const buf = getImageDataQuick(x*spriteX, y*spriteY, spriteX, spriteY, width, data);

            const ret = new ImageData(buf, spriteX, spriteY);
            return ret;
        }
    }
})