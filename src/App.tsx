import { Box, Container, HStack, List, VStack } from "@chakra-ui/react"
import { LuCheck } from "react-icons/lu"
import { SelectableList, SelectableListItem } from "./SelectableList"
import { useMemo, useState } from "react";

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
    <Container display={"grid"}>
      <HStack>
        <SelectableList items={inputColumnItems} h="full"></SelectableList>
        <SelectableList items={column2ListItems} h="full"></SelectableList>
      </HStack>
    </Container>    
  )
}

export default App
