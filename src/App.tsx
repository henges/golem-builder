import { Box, Center, Container, Grid, GridItem, Text } from "@chakra-ui/react"
import { SelectableList, SelectableListItem } from "./SelectableList"
import { useMemo, useState } from "react";
import { GolemDisplay } from "./GolemDisplay";
import { useGolemStore } from "./stores/GolemStore";
import { useShallow } from "zustand/shallow";
import { BuildGolemBody, AtzmusListElement, GetBodySpecialPropertiesElement } from "./qud-logic/Properties";
import { applyQudShader } from "./Colours";

function App() {

  const [ready, golemData, exportData, setBodySelection, setCatalystSelection] = useGolemStore(useShallow((s) => [s.ready, s.processedData, s.exportData, s.setBodySelection, s.setCatalystSelection]));

  const [column2ListItems, setColumn2ListItems] = useState<SelectableListItem[]>([]);

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

  const atmuzListItems = useMemo<SelectableListItem[]>(() => {
    return Object.entries(golemData.atzmuses.effects)
      .sort(([k1, _1], [k2, _2]) => k1.localeCompare(k2))
      .map(([k, b]) => (
        {
          name: k, 
          more: (<AtzmusListElement effect={b}/>),
          onSelect: () => {
          }
        }));
  }, [ready, golemData]);

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
        setColumn2ListItems(atmuzListItems);
      }
    }, 
    {
      name: "armament"
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
    </Container>
  )
}

export default App
