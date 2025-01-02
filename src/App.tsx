import { Box, Button, Center, Container, Grid, GridItem, List, ListItem, Text, useBreakpointValue, VStack } from "@chakra-ui/react"
import { SelectableList, SelectableListItem } from "./SelectableList"
import React, { useMemo, useState } from "react";
import { GolemDisplay } from "./GolemDisplay";
import { useGolemStore } from "./stores/GolemStore";
import { useShallow } from "zustand/shallow";
import { BuildGolemBody, GetBodySpecialPropertiesElement, CreateAtzmusListElement, WeaponToGameObjectUnits, CreateHamsaListElement, FormatGameObjectUnitDescription, GetSelectionEffectKey, hamsaVariants, splitByPredicate } from "./qud-logic/Properties";
import { applyQudShader } from "./Colours";
import { SourcePicker, SourcePickerContent } from "./SourcePicker";
import { QudSpriteRenderer } from "./QudSpriteRenderer";
import { GameObjectUnit } from "./qud-logic/GameObjectUnit";
import { QudInlineSprite } from "./QudInlineSprite";
import { ExportObjectHamsa } from "./ExportTypes";

function App() {

  const [ready, golemData, exportData, bodySelectionId, catalystSelectionId, atzmusSelectionEffectId, atzmusSelectionSourceId, weaponSelectionId, incantationSelectionId, hamsaSelectionEffectId, hamsaSelectionSourceId, setBodySelection, setCatalystSelection, setAtzmusSelection, setWeaponSelection, setIncantationSelection, setHamsaSelection, resetSelections, _getSelections] = useGolemStore(useShallow(
    (s) => [s.ready, s.processedData, s.exportData, s.bodySelectionId, s.catalystSelectionId, s.atzmusSelectionEffectId, s.atzmusSelectionSourceId, s.weaponSelectionId, s.incantationSelectionId, s.hamsaSelectionEffectId, s.hamsaSelectionSourceId, s.setBodySelection, s.setCatalystSelection, s.setAtzmusSelection, s.setWeaponSelection, s.setIncantationSelection, s.setHamsaSelection, s.resetSelections, s.getSelections]));

  const [column2ListItems, setColumn2ListItems] = useState<string>("empty");

  const bodyListItems = useMemo<SelectableListItem[]>(() => {
    return Object.entries(golemData.bodies)
      .map(([k, b]) => (
        {
          name: (<QudInlineSprite sprite={b.body.render}/>), 
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
    // console.log(effectsById);

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
      .flatMap(([k,b]) => {
        if (b.length === 0 || !golemData.hamsas.tagToSource[k] || !golemData.hamsas.tagToSource[k].length) {
          return [];
        }
        const sources = golemData.hamsas.tagToSource[k].map(s => golemData.hamsas.sources[s]);

        if (hamsaVariants[k]) {
          const variant = hamsaVariants[k];
          const [variantSources, nonVariantSources] = splitByPredicate(sources, s => variant.sourcePredicate(s));

          return [[k,b, nonVariantSources], [...hamsaVariants[k].buildVariant(b), variantSources]] as const;
        }
        return [[k,b,sources]] as const;
      })
      .reduce((agg: Record<string, {effects: GameObjectUnit[], sources: ExportObjectHamsa[]}>, [_k, b, sources]) => {
        const key = GetSelectionEffectKey(b);
        if (!agg[key]) {
          agg[key] = {effects: [...b], sources: []};
        }
        agg[key].sources.push(...sources);
        return agg;
      }, {});

    return Object.entries(effectsById)
      .sort(([k1, _1], [k2, _2]) => k1.localeCompare(k2))
      .map(([k, b]) => CreateHamsaListElement({name: k, granters: b.sources, effects: exportData.Hamsas, showModal: (a) => {
        setSourcePickerTitle("Select a hamsa source");
        setSourcePickerContents(a.map(([e, effects]) => ({id: e.id, render: e.render, more: () => {

          console.log(e, effects);
          const items = effects
            .map(([_k, v]) => v)
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
  const getListName: Record<string, () => React.ReactNode> = {
    "body": () => {
      if (!bodySelectionId) {
        return "body"
      }
      return <>
        body {"( "}<QudInlineSprite sprite={golemData.bodies[bodySelectionId].body.render}/>{")"}
        </>
    },
    "catalyst": () => {
      if (!catalystSelectionId) {
        return "catalyst"
      }
      return <>
        catalyst {"("}{applyQudShader(exportData.Liquids[catalystSelectionId].name)}{")"}
        </>
    },
    "atzmus": () => {
      if (!atzmusSelectionEffectId) {
        return "atzmus"
      }
      return <>
        atzmus {"("}{atzmusSelectionEffectId}{", from "}<QudInlineSprite sprite={golemData.atzmuses.granters[atzmusSelectionSourceId].render}/>{")"}
        </>
    },
    "armament": () => {
      if (!weaponSelectionId) {
        return "armament"
      }
      return <>
        armament {"("}<QudInlineSprite sprite={golemData.weapons[weaponSelectionId].render}/>{")"}
        </>
    },
    "incantation": () => {
      if (!incantationSelectionId) {
        return "incantation"
      }
      return <>
        incantation {"("}{incantationSelectionId}{")"}
        </>
    },
    "hamsa": () => {
      if (!hamsaSelectionEffectId) {
        return "hamsa"
      }
      return <>
        hamsa {"("}{hamsaSelectionEffectId}{", from "}<QudInlineSprite sprite={golemData.hamsas.sources[hamsaSelectionSourceId].render}/>{")"}
        </>
    },
  }

  const inputColumnItems: SelectableListItem[] = Object.keys(lists).map(k => ({name: getListName[k] ? getListName[k]() : k, onSelect: () => {setIsOpen(false); setColumn2ListItems(k)}, isSelected: column2ListItems === k}))

  // const logState = () => {

  //   console.log(_getSelections())
  // }
  const isCollapsibleEnabled = useBreakpointValue({ base: true, md: false });
  const [isOpen, setIsOpen] = useState(true);
  const toggleCollapse = () => setIsOpen(!isOpen);

  // return (
  //   <Container h="100%">hello</Container>
  // )

  return (
    <Container h={"100%"} p="2" pt="2" /*display={"grid"}*/>
      <Grid h="100%" templateRows={`repeat(${isCollapsibleEnabled ? 10 : 9}, 1fr)`}>
        <GridItem h="100%" rowSpan={9}>
          <Grid maxW="100%" h="100%" templateColumns={`repeat(${isCollapsibleEnabled ? 4 : 5}, 1fr)`} gap="3">
              {isCollapsibleEnabled ? (
                  <>
                    {isOpen && (
                      <Box
                        position="absolute"
                        top="0"
                        left="0"
                        width="100%"
                        height="100%"
                        bg="black"
                        zIndex="overlay"
                        p="4"
                        overflow="auto"
                      >
                        <VStack width="100%" h="100%">
                          <SelectableList
                            width="100%"
                            overflow="auto"
                            items={inputColumnItems}
                          />
                          <VStack marginTop="auto">
                            <Button variant={"outline"} onClick={resetSelections}>Reset</Button>
                            <Button variant={"outline"} onClick={toggleCollapse}>Close</Button>
                          </VStack>
                        </VStack>
                      </Box>
                    )}
                  </>
                ) : (
                <GridItem overflow="auto">
                  <VStack width="100%" overflow="auto" h="100%">
                    <SelectableList
                      width="100%"
                      overflow="auto"
                      items={inputColumnItems}
                    />
                    <Center marginTop="auto">
                      <Button variant={"outline"} onClick={resetSelections}>Reset</Button>
                    </Center>
                  </VStack>
                </GridItem>
                )}
            <GridItem colSpan={2} overflow="auto" h="100%">
              <SelectableList overflow="auto" items={lists[column2ListItems] || []}/>
            </GridItem>
            <GridItem colSpan={2} display="flex" overflow="auto">
                <GolemDisplay/>
            </GridItem>
          </Grid>
        </GridItem>
        {isCollapsibleEnabled ? 
        <Center>
          <Button variant={"outline"} onClick={toggleCollapse}>
            {isOpen ? "" : "Selections"}
          </Button>
        </Center> : null}
      </Grid>
      <SourcePicker title={sourcePickerTitle} open={sourcePickerOpen} setOpen={setSourcePickerOpen} onSave={(a) => sourcePickerAction(a)} contents={sourcePickerContents}/>
    </Container>
  )
}

export default App
