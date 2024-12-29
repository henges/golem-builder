import { Box, Center, Container, Grid, GridItem, HStack, List, VStack } from "@chakra-ui/react"
import { LuCheck } from "react-icons/lu"
import { SelectableList, SelectableListItem } from "./SelectableList"
import { useMemo, useState } from "react";
import { GolemDisplay } from "./GolemDisplay";
import { useGolemDataStore } from "./stores/GolemDataStore";
import { shallow, useShallow } from "zustand/shallow";
import { GolemBody } from "./ExportTypes";

function App() {

  const [ready, golemData] = useGolemDataStore(useShallow((s) => [s.ready, s.data]));

  const [column2ListItems, setColumn2ListItems] = useState<SelectableListItem[]>([]);

  const [bodySelection, setBodySelection] = useState<GolemBody>();

  const bodyListItems: SelectableListItem[] = useMemo(() => {
    return Object.values(golemData.bodies)
      .map(b => ({name: b.body.render.displayName, onSelect: () => {
        setBodySelection(b);
      }}));
  }, [ready, golemData]);

  const inputColumnItems: SelectableListItem[] = useMemo(() => [
    {
      name: "body",
      onSelect: () => {
        setColumn2ListItems(bodyListItems);
      }
    }, 
    {
      name: "incantation",
      onSelect: () => {
        setColumn2ListItems(incantationListItems);
      }
    }
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
      <Grid maxW="100%" h="100%" templateColumns="repeat(3, 1fr)" gap="6">
        <SelectableList overflow="scroll" items={inputColumnItems}/>
        <SelectableList overflow="scroll" items={column2ListItems}/>
        <Center>
          <GolemDisplay bodySelection={bodySelection}/>
        </Center>
      </Grid>
    </Container>
  )
}

export default App
