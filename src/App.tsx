import { Center, Container, Grid } from "@chakra-ui/react"
import { SelectableList, SelectableListItem } from "./SelectableList"
import { useMemo, useState } from "react";
import { GolemDisplay } from "./GolemDisplay";
import { useGolemStore } from "./stores/GolemStore";
import { useShallow } from "zustand/shallow";
import { GetBodySpecialPropertiesElement } from "./qud-logic/Properties";

function App() {

  const [ready, golemData, setBodySelection] = useGolemStore(useShallow((s) => [s.ready, s.data, s.setBodySelection]));

  const [column2ListItems, setColumn2ListItems] = useState<SelectableListItem[]>([]);

  const bodyListItems = useMemo<SelectableListItem[]>(() => {
    return Object.entries(golemData.bodies)
      .map(([k, b]) => (
        {
          name: b.body.render.displayName, 
          more: GetBodySpecialPropertiesElement(b.body),
          onSelect: () => {
            setBodySelection(k);
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
          <GolemDisplay/>
        </Center>
      </Grid>
    </Container>
  )
}

export default App
