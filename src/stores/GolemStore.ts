import { create } from 'zustand'
import { GolemBody, GolemData } from '../ExportTypes';

const load = async () => {

    const data = await fetch("assets/golem.json");
    const json = await data.json();
    return json as GolemData;
}

export type GolemSelectionStore = {
    bodySelectionId: string
    bodySelection: GolemBody | undefined
    bodyVariant: number
    setBodySelection: (s: string) => void
}

type GolemStore = GolemSelectionStore & {
    ready: boolean,
    data: GolemData
}

export const useGolemStore = create<GolemStore>((set, get) => {
    load().then((r) => set({ready: true, data: r}));
    return {
        bodySelectionId: "",
        bodySelection: undefined,
        bodyVariant: 0,
        setBodySelection: (s) => {
            if (!get().ready) {
                return;
            }
            set({bodySelectionId: s, bodySelection: get().data.bodies[s]})
        },
        ready: false,
        data: {bodies: {}, mutations: {}}
    }
});
