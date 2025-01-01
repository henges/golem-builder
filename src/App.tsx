import { Box, Center, Container, Grid, GridItem, Text } from "@chakra-ui/react"
import { SelectableList, SelectableListItem } from "./SelectableList"
import { useMemo, useState } from "react";
import { GolemDisplay } from "./GolemDisplay";
import { useGolemStore } from "./stores/GolemStore";
import { useShallow } from "zustand/shallow";
import { BuildGolemBody, GetBodySpecialPropertiesElement, CreateAtzmusListElement, WeaponToGameObjectUnits } from "./qud-logic/Properties";
import { applyQudShader } from "./Colours";
import { AtzmusSourcePicker } from "./AtzmusSourcePicker";
import { ExportObjectAtzmus } from "./ExportTypes";
import { QudSpriteRenderer } from "./QudSpriteRenderer";

function App() {

  const [ready, golemData, exportData, setBodySelection, setCatalystSelection, setAtzmusSelection, setWeaponSelection] = useGolemStore(useShallow(
    (s) => [s.ready, s.processedData, s.exportData, s.setBodySelection, s.setCatalystSelection, s.setAtzmusSelection, s.setWeaponSelection]));

  const [column2ListItems, setColumn2ListItems] = useState<SelectableListItem[]>([]);
  const [atzmusModalOpen, setAtzmusModalOpen] = useState<boolean>(false);

  const bodyListItems = useMemo<SelectableListItem[]>(() => {
    return Object.entries(golemData.bodies)
      .map(([k, b]) => (
        {
          name: b.body.render.displayName, 
          more: GetBodySpecialPropertiesElement(BuildGolemBody(b.body)),
          onSelect: () => {
            setBodySelection(k);
          }
        }));
  }, [ready, golemData]);

  const catalystListItems = useMemo<SelectableListItem[]>(() => {
    return Object.entries(exportData.Catalysts)
      .map(([k, b]) => (
        {
          name: applyQudShader(exportData.Liquids[k].name), 
          more: b.map(e => (<Text>{e.UnitDescription}</Text>)),
          onSelect: () => {
            setCatalystSelection(k);
          }
        }));
  }, [ready, exportData]);

  const atzmusListItems = useMemo<SelectableListItem[]>(() => {
    return Object.entries(golemData.atzmuses.effects)
      .sort(([k1, _1], [k2, _2]) => k1.localeCompare(k2))
      .map(([k, b]) => CreateAtzmusListElement({name: k, effect: b, granters: golemData.atzmuses.granters, showModal: (a) => {
        setAtzmusSourcePickerContents(a);
        setAtzmusModalOpen(true);
      }, setSelection: (s) => setAtzmusSelection(s)}));
  }, [ready, golemData]);

  const weaponListItems = useMemo<SelectableListItem[]>(() => {
    return Object.entries(golemData.weapons)
      .sort(([k1, _1], [k2, _2]) => k1.localeCompare(k2))
      .map(([k, b]) => (
        {
          name: ([<QudSpriteRenderer display="inline" sprite={b.render}/>, " ", applyQudShader(b.render.displayName)]), 
          more: (<Text>{WeaponToGameObjectUnits(b)[0].UnitDescription}</Text>),
          onSelect: () => {
            setWeaponSelection(k);
          }
        }));
  }, [ready, golemData]);

  const [atzmusSourcePickerContents, setAtzmusSourcePickerContents] = useState<ExportObjectAtzmus[]>([]);

  const inputColumnItems: SelectableListItem[] = useMemo(() => [
    {
      name: "body",
      onSelect: () => {
        setColumn2ListItems(bodyListItems);
      }
    }, 
    {
      name: "catalyst",
      onSelect: () => {
        setColumn2ListItems(catalystListItems);
      }
    }, 
    {
      name: "atzmus",
      onSelect: () => {
        setColumn2ListItems(atzmusListItems);
      }
    }, 
    {
      name: "armament",
      onSelect: () => {
        setColumn2ListItems(weaponListItems);
      }
    },
    {
      name: "incantation",
      onSelect: () => {
        setColumn2ListItems(incantationListItems);
      }
    }, 
    {
      name: "hamsa"
    },
  ], [bodyListItems]);

  const incantationListItems: SelectableListItem[] = [
    {
      name: "share effects of sultan mask"
    }, {
      name: "share effects of sultan mask 2"
    }
  ]

  return (
    <Container h={"100vh"} p="4" /*display={"grid"}*/>
      <Grid maxW="100%" h="100%" templateColumns="repeat(5, 1fr)" gap="6">
        <GridItem overflow="scroll">
          <SelectableList overflow="scroll" items={inputColumnItems}/>
        </GridItem>
        <GridItem colSpan={2} overflow="scroll">
          <SelectableList overflow="scroll" items={column2ListItems}/>
        </GridItem>
        <GridItem colSpan={2} display="flex">
            <GolemDisplay/>
        </GridItem>
      </Grid>
      <AtzmusSourcePicker open={atzmusModalOpen} setOpen={setAtzmusModalOpen} onSave={(a) => a !== undefined && setAtzmusSelection(a.id)} contents={atzmusSourcePickerContents}/>
    </Container>
  )
}

export default App
