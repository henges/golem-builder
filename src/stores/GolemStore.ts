import { create } from 'zustand'
import { GolemBody, GolemData } from '../ExportTypes';
import { ExportData } from '../ExportData';
import { GameObjectUnit } from '../qud-logic/GameObjectUnit';

const get = async <T>(path: string) => {
    
    const data = await fetch(path);
    const json = await data.json();
    return json as T;
}

const load = async () => {

    const golemData = await get<GolemData>("assets/golem.json");
    const exportData = await get<ExportData>("assets/qud-export-data.json");
    return [golemData, exportData] as const;
}

export type GolemSelectionStore = {
    bodySelectionId: string
    bodySelection: GolemBody | undefined
    catalystSelectionId: string
    catalystSelection: GameObjectUnit[]
    bodyVariant: number
    setBodySelection: (s: string) => void
    setCatalystSelection: (s: string) => void
}

type GolemStore = GolemSelectionStore & {
    ready: boolean,
    processedData: GolemData
    exportData: ExportData
}

export const useGolemStore = create<GolemStore>((set, get) => {
    load().then(([p, e]) => set({ready: true, processedData: p, exportData: e}));
    return {
        bodySelectionId: "",
        bodySelection: undefined,
        bodyVariant: 0,
        catalystSelectionId: "",
        catalystSelection: [],
        setBodySelection: (s) => {
            if (!get().ready) {
                return;
            }
            set({bodySelectionId: s, bodySelection: get().processedData.bodies[s]})
        },
        setCatalystSelection: (s) => {
            if (!get().ready) {
                return;
            }
            set({catalystSelectionId: s, catalystSelection: get().exportData.Catalysts[s]})
        },
        ready: false,
        processedData: {bodies: {}, mutations: {}, atzmuses: {effects: {}, granters: {}}},
        exportData: {Liquids: {}, Catalysts: {}, Incantations: {}, Hamsas: {}}
    }
});
