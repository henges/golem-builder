import { create } from 'zustand'
import { GolemBody, GolemData } from '../ExportTypes';
import { ExportData } from '../ExportData';

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
    bodyVariant: number
    setBodySelection: (s: string) => void
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
        setBodySelection: (s) => {
            if (!get().ready) {
                return;
            }
            set({bodySelectionId: s, bodySelection: get().processedData.bodies[s]})
        },
        ready: false,
        processedData: {bodies: {}, mutations: {}},
        exportData: {Liquids: {}, Catalysts: {}, Incantations: {}, Hamsas: {}}
    }
});
