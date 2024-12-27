import { Box, Center, Container, HStack, List, VStack } from "@chakra-ui/react"
import { LuCheck } from "react-icons/lu"
import { SelectableList, SelectableListItem } from "./SelectableList"
import { useMemo, useState } from "react";
import { GolemDisplay } from "./GolemDisplay";

function App() {

  const [column2ListItems, setColumn2ListItems] = useState<SelectableListItem[]>([]);

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
  ], []);

  const bodyListItems: SelectableListItem[] = [
    {
      name: "dog golem"
    }
  ]

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
        <SelectableList minW={"160px"} items={column2ListItems} h="full"></SelectableList>
        <GolemDisplay selections={{}}/>
      </HStack>
    </Center>    
  )
}

export default App
