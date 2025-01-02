import { create } from 'zustand'
import { ExportMutation, ExportObjectHamsa, GolemBody, GolemData } from '../ExportTypes';
import { Effects, ExportData } from '../ExportData';
import { ConditionalGameObjectUnitGroup, GameObjectAttributeUnit, GameObjectMutationUnit, GameObjectUnit } from '../qud-logic/GameObjectUnit';
import { GetValidHamsaEffectsForObj, WeaponToGameObjectUnits } from '../qud-logic/Properties';

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

export type GolemSelectionStore = GolemSelections & {
    setBodySelection: (s: string) => void
    setBodyVariantId: (id: number) => void
    setCatalystSelection: (s: string) => void
    setAtzmusSelection: (effect: string, source: string) => void
    setWeaponSelection: (s: string) => void
    setIncantationSelection: (effect: string, source: string) => void
    setHamsaSelection: (effect: string, source: string) => void
    resetSelections: () => void
    getSelections: () => GolemSelections
}

export type GolemSelections = {
    bodySelectionId: string
    bodySelection: GolemBody | undefined
    bodyVariant: string[]
    bodyVariantId: number
    catalystSelectionId: string
    catalystSelection: GameObjectUnit[]
    atzmusSelectionEffectId: string
    atzmusSelectionSourceId: string
    atzmusSelection: ConditionalGameObjectUnitGroup
    weaponSelectionId: string
    weaponSelection: GameObjectUnit[]
    incantationSelectionId: string
    incantationSelection: GameObjectUnit[]
    hamsaSelectionEffectId: string
    hamsaSelectionSourceId: string
    hamsaSelection: ConditionalGameObjectUnitGroup
}

type GolemStore = GolemSelectionStore & {
    ready: boolean,
    processedData: GolemData
    exportData: ExportData
}

const atzmusGrantsToGameObjectUnits = (grants: string[] | ExportMutation[]): ConditionalGameObjectUnitGroup => {

    if (grants.length === 0) {
        return {certain: false, units: []};
    }
    if (typeof grants[0] === "string") {
        const units: GameObjectAttributeUnit[] = (grants as string[]).map(g => ({
            UnitDescription: `+5 ${g}`,
            UnitType: "GameObjectAttributeUnit",
            Attribute: g,
            Value: 5,
            Percent: false
        }))
        return {certain: units.length === 1, units: units}
    } else {
        const units: GameObjectMutationUnit[] = (grants as ExportMutation[]).map(g => ({
            UnitDescription: `${g.name} ${g.level}`,
            UnitType: "GameObjectMutationUnit",
            Class: null,
            Name: g.name,
            Level: parseInt(g.level || "1") || 1,
            Enhance: true,
            ShouldShowLevel: g.showLevel
        }))
        return {certain: units.length === 1, units: units}
    }
}

const hamsaSelectionToGameObjectUnits = (selected: ExportObjectHamsa, hamsas: Effects): ConditionalGameObjectUnitGroup => {
    
    const units = GetValidHamsaEffectsForObj(selected, hamsas);
    return {certain: units.length === 1, units: units.flatMap(([_k, v]) => v)};
}

const defaultSelectionState = (): GolemSelections => ({
    bodySelectionId: "",
    bodySelection: undefined,
    bodyVariantId: -1,
    bodyVariant: [],
    catalystSelectionId: "",
    catalystSelection: [],
    atzmusSelectionEffectId: "",
    atzmusSelectionSourceId: "",
    atzmusSelection: {certain: false, units: []},
    weaponSelectionId: "",
    weaponSelection: [],
    incantationSelectionId: "",
    incantationSelection: [],
    hamsaSelectionEffectId: "",
    hamsaSelectionSourceId: "",
    hamsaSelection: {certain: false, units: []}
});

export const useGolemStore = create<GolemStore>((set, get) => {
    load().then(([p, e]) => set({ready: true, processedData: p, exportData: e}));
    return {
        ...defaultSelectionState(),
        setBodySelection: (s) => {
            if (!get().ready) {
                return;
            }
            const variants = get().processedData.bodies[s].patterns;
            let bodyVariantId = -1, bodyVariant: string[] = [];
            if (variants.length === 1) {
                bodyVariantId = 0;
                bodyVariant = [...variants[0]];
            }

            set({bodySelectionId: s, bodySelection: get().processedData.bodies[s], bodyVariantId: bodyVariantId, bodyVariant: bodyVariant})
        },
        setBodyVariantId: (id: number) => {
            if (!get().ready) {
                return;
            }
            set({bodyVariantId: id, bodyVariant: [...get().processedData.bodies[get().bodySelectionId].patterns[id]]})
        },
        setCatalystSelection: (s) => {
            if (!get().ready) {
                return;
            }
            set({catalystSelectionId: s, catalystSelection: get().exportData.Catalysts[s]})
        },
        setAtzmusSelection: (effect: string, source: string) => {
            if (!get().ready) {
                return;
            }
            set({atzmusSelectionEffectId: effect, atzmusSelectionSourceId: source, atzmusSelection: atzmusGrantsToGameObjectUnits(get().processedData.atzmuses.granters[source].grants)})
        },
        setWeaponSelection: (s) => {
            if (!get().ready) {
                return;
            }
            set({weaponSelectionId: s, weaponSelection: WeaponToGameObjectUnits(get().processedData.weapons[s])})
        },
        setIncantationSelection: (effect: string, category: string) => {
            if (!get().ready) {
                return;
            }
            set({incantationSelectionId: effect, incantationSelection: get().exportData.Incantations[category]})
        },
        setHamsaSelection: (effect: string, source: string) => {
            if (!get().ready) {
                return;
            }
            set({hamsaSelectionEffectId: effect, hamsaSelectionSourceId: source, hamsaSelection: hamsaSelectionToGameObjectUnits(get().processedData.hamsas.sources[source], get().exportData.Hamsas)})
        },
        resetSelections: () => {set({...defaultSelectionState()})},
        getSelections: () => {
            const state = get(); 
            return {
                bodySelectionId: state.bodySelectionId,
                bodySelection: state.bodySelection,
                bodyVariant: state.bodyVariant,
                bodyVariantId: state.bodyVariantId,
                catalystSelectionId: state.catalystSelectionId,
                catalystSelection: state.catalystSelection,
                atzmusSelectionEffectId: state.atzmusSelectionEffectId,
                atzmusSelectionSourceId: state.atzmusSelectionSourceId,
                atzmusSelection: state.atzmusSelection,
                weaponSelectionId: state.weaponSelectionId,
                weaponSelection: state.weaponSelection,
                incantationSelectionId: state.incantationSelectionId,
                incantationSelection: state.incantationSelection,
                hamsaSelectionEffectId: state.hamsaSelectionEffectId,
                hamsaSelectionSourceId: state.hamsaSelectionSourceId,
                hamsaSelection: state.hamsaSelection,
            }
        },
        ready: false,
        processedData: {bodies: {}, mutations: {}, atzmuses: {effects: {}, granters: {}}, weapons: {}, muralCategories: {}, hamsas: {tagToSource: {}, sources: {}}},
        exportData: {Liquids: {}, Catalysts: {}, Incantations: {}, Hamsas: {}}
    }
});
