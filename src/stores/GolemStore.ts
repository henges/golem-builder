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
    getSelectionIds: () => GolemSelectionIds
    setSelectionIds: (s: Record<string, GolemSelectionIds[keyof GolemSelectionIds]>) => void
}

export type GolemSelections = GolemSelectionIds & {
    bodySelection: GolemBody | undefined
    bodyVariant: string[]
    catalystSelection: GameObjectUnit[]
    atzmusSelection: ConditionalGameObjectUnitGroup
    weaponSelection: GameObjectUnit[]
    incantationSelection: GameObjectUnit[]
    hamsaSelection: ConditionalGameObjectUnitGroup
}

export type GolemSelectionIds = {
    bodySelectionId: string
    bodyVariantId: number
    catalystSelectionId: string
    atzmusSelectionEffectId: string
    atzmusSelectionSourceId: string
    weaponSelectionId: string
    incantationSelectionEffectId: string
    incantationSelectionSourceId: string
    hamsaSelectionEffectId: string
    hamsaSelectionSourceId: string
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

const newSelectionIdsState = (): GolemSelectionIds => ({
    bodySelectionId: "",
    bodyVariantId: -1,
    catalystSelectionId: "",
    atzmusSelectionEffectId: "",
    atzmusSelectionSourceId: "",
    weaponSelectionId: "",
    incantationSelectionEffectId: "",
    incantationSelectionSourceId: "",
    hamsaSelectionEffectId: "",
    hamsaSelectionSourceId: "",
})

const newSelectionState = (): GolemSelections => ({
    ...newSelectionIdsState(),
    bodySelection: undefined,
    bodyVariant: [],
    catalystSelection: [],
    atzmusSelection: {certain: false, units: []},
    weaponSelection: [],
    incantationSelection: [],
    hamsaSelection: {certain: false, units: []}
});

export const useGolemStore = create<GolemStore>((set, get) => {
    load().then(([p, e]) => set({ready: true, processedData: p, exportData: e}));
    return {
        ...newSelectionState(),
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

            set({bodySelectionId: s, bodySelection: s === "" ? undefined : get().processedData.bodies[s], bodyVariantId: bodyVariantId, bodyVariant: bodyVariant})
        },
        setBodyVariantId: (id: number) => {
            if (!get().ready) {
                return;
            }
            set({bodyVariantId: id, bodyVariant: id === -1 ? [] : [...get().processedData.bodies[get().bodySelectionId].patterns[id]]})
        },
        setCatalystSelection: (s) => {
            if (!get().ready) {
                return;
            }
            set({catalystSelectionId: s, catalystSelection: s === "" ? [] : get().exportData.Catalysts[s]})
        },
        setAtzmusSelection: (effect: string, source: string) => {
            if (!get().ready) {
                return;
            }
            set({atzmusSelectionEffectId: effect, atzmusSelectionSourceId: source, atzmusSelection: effect === "" ?  {certain: false, units: []} : atzmusGrantsToGameObjectUnits(get().processedData.atzmuses.granters[source].grants)})
        },
        setWeaponSelection: (s) => {
            if (!get().ready) {
                return;
            }
            set({weaponSelectionId: s, weaponSelection: s === "" ? [] : WeaponToGameObjectUnits(get().processedData.weapons[s])})
        },
        setIncantationSelection: (effect: string, category: string) => {
            if (!get().ready) {
                return;
            }
            set({incantationSelectionEffectId: effect, incantationSelectionSourceId: category, incantationSelection: effect === "" ? [] : get().exportData.Incantations[category]})
        },
        setHamsaSelection: (effect: string, source: string) => {
            if (!get().ready) {
                return;
            }
            set({hamsaSelectionEffectId: effect, hamsaSelectionSourceId: source, hamsaSelection: effect === "" ? {certain: false, units: []} :  hamsaSelectionToGameObjectUnits(get().processedData.hamsas.sources[source], get().exportData.Hamsas)})
        },
        resetSelections: () => {set({...newSelectionState()})},
        load: (s: Partial<GolemSelectionIds>) => {
            set({...s})
        },
        getSelectionIds: () => {
            const state = get(); 
            return {
                bodySelectionId: state.bodySelectionId,
                bodyVariantId: state.bodyVariantId,
                catalystSelectionId: state.catalystSelectionId,
                atzmusSelectionEffectId: state.atzmusSelectionEffectId,
                atzmusSelectionSourceId: state.atzmusSelectionSourceId,
                weaponSelectionId: state.weaponSelectionId,
                incantationSelectionEffectId: state.incantationSelectionEffectId,
                incantationSelectionSourceId: state.incantationSelectionSourceId,
                hamsaSelectionEffectId: state.hamsaSelectionEffectId,
                hamsaSelectionSourceId: state.hamsaSelectionSourceId,
            }
        },
        getSelections: () => {
            const state = get(); 
            return {
                ...state.getSelectionIds(),
                bodySelection: state.bodySelection,
                bodyVariant: state.bodyVariant,
                catalystSelection: state.catalystSelection,
                atzmusSelection: state.atzmusSelection,
                weaponSelection: state.weaponSelection,
                incantationSelection: state.incantationSelection,
                hamsaSelection: state.hamsaSelection,
            }
        },
        setSelectionIds: (s) => {
            console.log(s);
            const update = Object.assign(newSelectionIdsState(), s);
            const state = get();
            state.setBodySelection(update.bodySelectionId);
            state.setBodyVariantId(update.bodyVariantId);
            state.setCatalystSelection(update.catalystSelectionId);
            state.setAtzmusSelection(update.atzmusSelectionEffectId, update.atzmusSelectionSourceId);
            state.setWeaponSelection(update.weaponSelectionId);
            state.setIncantationSelection(update.incantationSelectionEffectId, update.incantationSelectionSourceId);
            state.setHamsaSelection(update.hamsaSelectionEffectId, update.hamsaSelectionSourceId);
        },
        ready: false,
        processedData: {bodies: {}, mutations: {}, atzmuses: {effects: {}, granters: {}}, weapons: {}, muralCategories: {}, hamsas: {tagToSource: {}, sources: {}}},
        exportData: {Liquids: {}, Catalysts: {}, Incantations: {}, Hamsas: {}}
    }
});
