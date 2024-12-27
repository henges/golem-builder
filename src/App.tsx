import { Box, Center, Container, HStack, List, VStack } from "@chakra-ui/react"
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
    <Center display={"grid"}>
      <HStack minW={"100%"}>
        <SelectableList minW={"160px"} items={inputColumnItems} h="full"></SelectableList>
        <SelectableList maxH={"160px"} overflowY="auto" minW={"160px"} items={column2ListItems} h="full"></SelectableList>
        <GolemDisplay selections={{}} bodySelection={bodySelection}/>
      </HStack>
    </Center>    
  )
}

export default App
