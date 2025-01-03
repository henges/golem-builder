import { Box, Button, Center, Container, Grid, GridItem, List, ListItem, Text, useBreakpointValue, VStack } from "@chakra-ui/react"
import { SelectableList, SelectableListItem } from "./SelectableList"
import React, { useEffect, useMemo, useRef, useState } from "react";
import { GolemDisplay } from "./GolemDisplay";
import { GolemSelectionIds, useGolemStore } from "./stores/GolemStore";
import { useShallow } from "zustand/shallow";
import { BuildGolemBody, GetBodySpecialPropertiesElement, CreateAtzmusListElement, WeaponToGameObjectUnits, CreateHamsaListElement, FormatGameObjectUnitDescription, GetSelectionEffectKey, hamsaVariants, splitByPredicate } from "./qud-logic/Properties";
import { applyQudShader } from "./Colours";
import { SourcePicker, SourcePickerContent } from "./SourcePicker";
import { QudSpriteRenderer } from "./QudSpriteRenderer";
import { GameObjectUnit } from "./qud-logic/GameObjectUnit";
import { QudInlineSprite } from "./QudInlineSprite";
import { ExportObjectHamsa } from "./ExportTypes";
import { Liquid } from "./ExportData";
import { LuCircle } from "react-icons/lu";

function App() {

  const [ready, golemData, exportData, bodySelectionId, catalystSelectionId, atzmusSelectionEffectId, atzmusSelectionSourceId, weaponSelectionId, incantationSelectionEffectId, hamsaSelectionEffectId, hamsaSelectionSourceId, setBodySelection, setCatalystSelection, setAtzmusSelection, setWeaponSelection, setIncantationSelection, setHamsaSelection, resetSelections, _getSelections, getSelectionIds, setSelectionIds] = useGolemStore(useShallow(
    (s) => [s.ready, s.processedData, s.exportData, s.bodySelectionId, s.catalystSelectionId, s.atzmusSelectionEffectId, s.atzmusSelectionSourceId, s.weaponSelectionId, s.incantationSelectionEffectId, s.hamsaSelectionEffectId, s.hamsaSelectionSourceId, s.setBodySelection, s.setCatalystSelection, s.setAtzmusSelection, s.setWeaponSelection, s.setIncantationSelection, s.setHamsaSelection, s.resetSelections, s.getSelections, s.getSelectionIds, s.setSelectionIds]));

  const [column2ListItems, setColumn2ListItems] = useState<string>("empty");
  const column2Ref = useRef<HTMLDivElement>(null);
  const column3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    column2Ref.current?.scrollTo(0, 0);
  }, [column2ListItems]);

  const loadGolem = (b64string: string) => {

    const restore = JSON.parse(atob(b64string)) as Record<string, string | number>;
    const loaded = getSelectionIds();
    const ret: Record<string, string | number> = {};
    const keys = Object.keys(loaded) as Array<keyof GolemSelectionIds>;
    for (const k of keys) {
      const idKey = getIdKeySerialised(k);
      ret[k] = restore[idKey];
    }

    setSelectionIds(ret);
  }

  const getIdKeySerialised = (k: string) => {
    return [...k].filter((v, i) => i === 0 || v.toUpperCase() === v).map(v => v.toLowerCase()).join("");
  }

  const getIdsSerialised = (ids: GolemSelectionIds) => {

    const ret: Record<string, unknown> = {};
    for (const [k,v] of Object.entries(ids)) {
      ret[getIdKeySerialised(k)] = v;
    }

    return ret;
  }

  useEffect(() => {
    if (!ready) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const load = params.get("load");
    if (load) {
      loadGolem(load);
    }
  }, [ready]);

  useEffect(() => {

    if (!ready) {
      return;
    }
    const listener = (event: PopStateEvent) => {
      console.log(event.state)
      if (!event.state.cmd) {
        resetSelections();
        return;
      }

      if (event.state.cmd) {
        const cmd = event.state.cmd as string;
        if (cmd === "reset") {
          resetSelections();
          return;
        }
        if (cmd === "load") {
          const data = event.state.data as string;
          if (!data) {
            return;
          }
          loadGolem(decodeURIComponent(data));
        }
      }
    }; 
    addEventListener("popstate", listener);

    return () => {
      removeEventListener("popstate", listener)
    }
  }, [ready])

  useEffect(() => {
    // column3Ref.current?.scrollTo(0, 0);
  }, [bodySelectionId, catalystSelectionId, atzmusSelectionEffectId, atzmusSelectionSourceId, weaponSelectionId, incantationSelectionEffectId, hamsaSelectionEffectId, hamsaSelectionSourceId]);

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

  const spriteTilePath = "Liquids/Water/deep-00000000.png";

  const liquidRender = (l: Liquid) => {
    return <QudInlineSprite sprite={{displayName: `3 drams of ${l.name}`, mainColour: l.colors[0], detailColour: l.colors[1], tile: spriteTilePath}}/>
  }

  const catalystListItems = useMemo<SelectableListItem[]>(() => {
    return Object.entries(exportData.Catalysts)
      .map(([k, b]) => (
        {
          name: liquidRender(exportData.Liquids[k]), 
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
          isSelected: incantationSelectionEffectId === k
        }));
  }, [ready, golemData, exportData, incantationSelectionEffectId]);

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
          const items = effects
            .map(([_k, v]) => v)
            .filter(d => d.length > 0)
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
        catalyst {"( "}{liquidRender(exportData.Liquids[catalystSelectionId])}{")"}
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
      if (!incantationSelectionEffectId) {
        return "incantation"
      }
      return <>
        incantation {"("}{incantationSelectionEffectId}{")"}
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

  const logState = () => {
    
    // const selections = getSelections();
    // const s: string[] = [];
    // if (selections.bodySelectionId) {
    //   s.push(`Body: ${golemData.bodies[selections.bodySelectionId].body.render.displayName}`);
    // }
    // if (selections.catalystSelectionId) {
    //   s.push(`Catalyst: ${selections.catalystSelectionId}`);
    // }
    // if (selections.atzmusSelectionEffectId) {
    //   s.push(`Atzmus: effect: ${selections.atzmusSelectionEffectId}, source: ${stripQudMarkup(golemData.atzmuses.granters[selections.atzmusSelectionSourceId].render.displayName)}`)
    // }
    // if (selections.weaponSelectionId) {
    //   s.push(`Armament: ${stripQudMarkup(golemData.weapons[selections.weaponSelectionId].render.displayName)}`);
    // }
    // if (selections.incantationSelectionEffectId) {
    //   s.push(`Incantation: effect: ${selections.incantationSelectionEffectId}`)
    // }
    // if (selections.hamsaSelectionEffectId) {
    //   s.push(`Hamsa: effect: ${selections.hamsaSelectionEffectId}, source: ${stripQudMarkup(golemData.hamsas.sources[selections.hamsaSelectionSourceId].render.displayName)}`)
    // }
    // const str = s.join("\n");
    // console.log(str);

    const ids = getSelectionIds();
    const serial = getIdsSerialised(ids);

    const b64Enc = encodeURIComponent(btoa(JSON.stringify(serial)));
    const qp = `?load=${b64Enc}`
    const url = `${window.location.protocol}//${window.location.host}${window.location.pathname}${qp}`;
    navigator.clipboard.writeText(url);
    if (window.location.search !== qp) {
      history.pushState({cmd: "load", data: b64Enc}, '', qp);
    }
    showCopiedText();
  }
  const isCollapsibleEnabled = useBreakpointValue({ base: true, md: false });
  const [isOpen, setIsOpen] = useState(true);
  const toggleCollapse = () => setIsOpen(!isOpen);

  const copyButtonDefaultText = "Copy shareable URL"
  const [copyURLButtonText, setCopyURLButtonText] = useState(copyButtonDefaultText)
  const showCopiedText = () => {

    setCopyURLButtonText("Copied!")
    setTimeout(() => {
      setCopyURLButtonText(copyButtonDefaultText);
    }, 1500);
  }

  // return (
  //   <Container h="100%">hello</Container>
  // )

  const controlButtons = () => {
    return <>
      
      <Button variant={"outline"} whiteSpace={"wrap"} onClick={logState}>{copyURLButtonText}</Button>
      <Button variant={"outline"} onClick={() => {if (window.location.search) {history.pushState({cmd: "reset"}, '', './')}; resetSelections()}}>Reset</Button>
    </>
  }

  const selectionsList = () => (
    <SelectableList
      width="100%"
      overflow="auto"
      items={inputColumnItems}
      listIconSelected={<LuCircle fill="green"/>}
      listIconUnselected={<LuCircle/>}
    />
  )

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
                          {selectionsList()}
                          <VStack marginTop="auto">
                            {controlButtons()}
                            <Button variant={"outline"} onClick={toggleCollapse}>Close</Button>
                          </VStack>
                        </VStack>
                      </Box>
                    )}
                  </>
                ) : (
                <GridItem overflow="auto">
                  <VStack width="100%" overflow="auto" h="100%">
                    {selectionsList()}
                    <VStack marginTop="auto">
                      {controlButtons()}
                    </VStack>
                  </VStack>
                </GridItem>
                )}
            <GridItem ref={column2Ref} colSpan={2} overflow="auto" h="100%">
              <SelectableList items={lists[column2ListItems] || []}/>
            </GridItem>
            <GridItem ref={column3Ref} colSpan={2} display="flex" overflow="auto">
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
