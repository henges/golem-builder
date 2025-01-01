import { Box, Button, Container, Grid, GridItem, List, ListItem, Text, VStack } from "@chakra-ui/react"
import { SelectableList, SelectableListItem } from "./SelectableList"
import { useMemo, useState } from "react";
import { GolemDisplay } from "./GolemDisplay";
import { useGolemStore } from "./stores/GolemStore";
import { useShallow } from "zustand/shallow";
import { BuildGolemBody, GetBodySpecialPropertiesElement, CreateAtzmusListElement, WeaponToGameObjectUnits, CreateHamsaListElement, FormatGameObjectUnitDescription, GetSelectionEffectKey } from "./qud-logic/Properties";
import { applyQudShader } from "./Colours";
import { SourcePicker, SourcePickerContent } from "./SourcePicker";
import { QudSpriteRenderer } from "./QudSpriteRenderer";
import { GameObjectUnit } from "./qud-logic/GameObjectUnit";

function App() {

  const [ready, golemData, exportData, bodySelectionId, catalystSelectionId, atzmusSelectionEffectId, weaponSelectionId, incantationSelectionId, hamsaSelectionEffectId, setBodySelection, setCatalystSelection, setAtzmusSelection, setWeaponSelection, setIncantationSelection, setHamsaSelection, resetSelections] = useGolemStore(useShallow(
    (s) => [s.ready, s.processedData, s.exportData, s.bodySelectionId, s.catalystSelectionId, s.atzmusSelectionEffectId, s.weaponSelectionId, s.incantationSelectionId, s.hamsaSelectionEffectId, s.setBodySelection, s.setCatalystSelection, s.setAtzmusSelection, s.setWeaponSelection, s.setIncantationSelection, s.setHamsaSelection, s.resetSelections]));

  const [column2ListItems, setColumn2ListItems] = useState<string>("empty");

  const bodyListItems = useMemo<SelectableListItem[]>(() => {
    return Object.entries(golemData.bodies)
      .map(([k, b]) => (
        {
          name: b.body.render.displayName, 
          more: GetBodySpecialPropertiesElement(BuildGolemBody(b.body)),
          onSelect: () => {
            setBodySelection(k);
          },
          isSelected: bodySelectionId === k
        }));
  }, [ready, golemData, bodySelectionId]);

  const catalystListItems = useMemo<SelectableListItem[]>(() => {
    return Object.entries(exportData.Catalysts)
      .map(([k, b]) => (
        {
          name: applyQudShader(exportData.Liquids[k].name), 
          more: b.map(e => (<Text>{e.UnitDescription}</Text>)),
          onSelect: () => {
            setCatalystSelection(k);
          },
          isSelected: k === catalystSelectionId
        }));
  }, [ready, exportData, catalystSelectionId]);

  const atzmusListItems = useMemo<SelectableListItem[]>(() => {
    return Object.entries(golemData.atzmuses.effects)
      .sort(([k1, _1], [k2, _2]) => k1.localeCompare(k2))
      .map(([k, b]) => CreateAtzmusListElement({name: k, effect: b, granters: golemData.atzmuses.granters, showModal: (a) => {
        setSourcePickerTitle("Select an atzmus source");
        setSourcePickerContents(a.map(e => ({id: e.id, render: e.render, more: () => (
          <List.Root listStyleType={"none"} minW={"100%"} textAlign={e.grants.length === 1 ? "center" : "left"}>
            {e.grants.filter(g => typeof(g) === "string").map((s, i, a) => <ListItem>{"+5 "}{s}{i === a.length-1 ? "" : " OR"}</ListItem>)}
            {e.grants.filter(g => typeof(g) === "object").map((g, i, a) => (<ListItem>{g.name} {g.level}{i === a.length-1 ? "" : " OR"}</ListItem>))}
          </List.Root>
        )})));
        setSourcePickerAction(() => (s: string) => s !== undefined && setAtzmusSelection(k, s));
        setSourcePickerOpen(true);
      }, setSelection: (s) => setAtzmusSelection(k, s), isSelected: atzmusSelectionEffectId == k}));
  }, [ready, golemData, atzmusSelectionEffectId]);

  const weaponListItems = useMemo<SelectableListItem[]>(() => {
    return Object.entries(golemData.weapons)
      .sort(([k1, _1], [k2, _2]) => k1.localeCompare(k2))
      .map(([k, b]) => (
        {
          name: ([<QudSpriteRenderer display="inline" sprite={b.render}/>, " ", applyQudShader(b.render.displayName)]), 
          more: (<Text>{WeaponToGameObjectUnits(b)[0].UnitDescription}</Text>),
          onSelect: () => {
            setWeaponSelection(k);
          },
          isSelected: weaponSelectionId === k
        }));
  }, [ready, golemData, weaponSelectionId]);

  const incantationListItems = useMemo<SelectableListItem[]>(() => {
    const effectsById = Object.entries(exportData.Incantations)
      .filter(([k, b]) => b.length > 0 && golemData.muralCategories[k]?.length > 0)
      .reduce((agg: Record<string, {effects: GameObjectUnit[], muralCategories: string[], sources: string[]}>, [k, b]) => {
        const sources = golemData.muralCategories[k];
        const key = GetSelectionEffectKey(b);
        if (!agg[key]) {
          agg[key] = {effects: [...b], muralCategories: [], sources: []};
        }
        agg[key].muralCategories.push(k);
        agg[key].sources.push(...sources);
        return agg;
      }, {});
    console.log(effectsById);

    return Object.entries(effectsById)
      .sort(([k1, _1], [k2, _2]) => k1.localeCompare(k2))
      .map(([k, b]) => (
        {
          name: (<Text>{k}</Text>), 
          more: (<List.Root>{b.sources.map(c => (<ListItem key={c}>{c}</ListItem>))}</List.Root>),
          onSelect: () => {
            setIncantationSelection(k, b.muralCategories[0]);
          },
          isSelected: incantationSelectionId === k
        }));
  }, [ready, golemData, exportData, incantationSelectionId]);

  const hamsaListItems = useMemo<SelectableListItem[]>(() => {
    const effectsById = Object.entries(exportData.Hamsas)
      .filter(([k, b]) => b.length > 0 && golemData.hamsas.tagToSource[k]?.length > 0)
      .reduce((agg: Record<string, {effects: GameObjectUnit[], sources: string[]}>, [k, b]) => {
        const sources = golemData.hamsas.tagToSource[k];
        const key = GetSelectionEffectKey(b);
        if (!agg[key]) {
          agg[key] = {effects: [...b], sources: []};
        }
        agg[key].sources.push(...sources);
        return agg;
      }, {});

    return Object.entries(effectsById)
      .sort(([k1, _1], [k2, _2]) => k1.localeCompare(k2))
      .map(([k, b]) => CreateHamsaListElement({name: k, effects: exportData.Hamsas, granters: b.sources, allGranters: golemData.hamsas.sources, showModal: (a) => {
        setSourcePickerTitle("Select a hamsa source");
        setSourcePickerContents(a.map(e => ({id: e.id, render: e.render, more: () => {
          const items = e.semanticTags
            .map(t => exportData.Hamsas[t] || [])
            .flatMap(gous => gous.map(gou => FormatGameObjectUnitDescription(gou.UnitDescription)).join(", "))
            .filter(d => d.length > 0);
          return (
            <List.Root listStyleType={"none"} minW={"100%"} textAlign={items.length === 1 ? "center" : "left"}>
              {items.map((d, i, a) => (<ListItem>{d}{i === a.length-1 ? "" : " OR"}</ListItem>))} 
            </List.Root>
          ) 
        } })));
        setSourcePickerAction(() => (s: string) => s !== undefined && setHamsaSelection(k, s));
        setSourcePickerOpen(true);
      }, setSelection: (s) => setHamsaSelection(k, s), isSelected: hamsaSelectionEffectId === k}));
  }, [ready, golemData, hamsaSelectionEffectId]);

  const [sourcePickerTitle, setSourcePickerTitle] = useState<string>("");
  const [sourcePickerAction, setSourcePickerAction] = useState<(s: string | undefined) => void>(() => {});
  const [sourcePickerContents, setSourcePickerContents] = useState<SourcePickerContent[]>([]);
  const [sourcePickerOpen, setSourcePickerOpen] = useState<boolean>(false);

  const lists: Record<string, SelectableListItem[]> = {"body": bodyListItems, "catalyst": catalystListItems, "atzmus": atzmusListItems, "armament": weaponListItems, "incantation": incantationListItems, "hamsa": hamsaListItems};

  const inputColumnItems: SelectableListItem[] = Object.keys(lists).map(k => ({name: k, onSelect: () => {setColumn2ListItems(k)}, isSelected: column2ListItems === k}))

  return (
    <Container h={"100vh"} p="4" /*display={"grid"}*/>
      <Grid maxW="100%" h="100%" templateColumns="repeat(5, 1fr)" gap="6">
        <GridItem overflow="scroll">
          <VStack h="100%">
            <SelectableList overflow="scroll" items={inputColumnItems}/>
            <Box marginTop="auto">
              <Button onClick={resetSelections}>Reset</Button>
            </Box>
          </VStack>
        </GridItem>
        <GridItem colSpan={2} overflow="scroll">
          <SelectableList overflow="scroll" items={lists[column2ListItems] || []}/>
        </GridItem>
        <GridItem colSpan={2} display="flex">
            <GolemDisplay/>
        </GridItem>
      </Grid>
      <SourcePicker title={sourcePickerTitle} open={sourcePickerOpen} setOpen={setSourcePickerOpen} onSave={(a) => sourcePickerAction(a)} contents={sourcePickerContents}/>
    </Container>
  )
}

export default App
