import { create } from 'zustand'
import { GolemData } from '../ExportTypes';

const load = async () => {

    const data = await fetch("assets/golem.json");
    const json = await data.json();
    return json as GolemData;
}

type GolemStore = {
    ready: boolean,
    data: GolemData
}

export const useGolemDataStore = create<GolemStore>((set) => {
    load().then((r) => set({ready: true, data: r}));
    return {
        ready: false,
        data: {bodies: {}, mutations: {}}
    }
});
