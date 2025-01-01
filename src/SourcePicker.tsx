import { Button, Grid, Text, useBreakpointValue, VStack } from "@chakra-ui/react";
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter, DialogActionTrigger, DialogCloseTrigger } from "./components/ui/dialog"
import { QudSpriteRenderer } from "./QudSpriteRenderer";
import { ExportRender } from "./ExportTypes";
import { applyQudShader } from "./Colours";
import React, { useEffect, useState } from "react";

export interface AtzmusSourcePickerProps {
  open: boolean;
  title: string;
  setOpen: (b: boolean) => void;
  onSave: (a: string | undefined) => void;
  contents: SourcePickerContent[];
}

export interface SourcePickerContent {
  id: string;
  render: ExportRender;
  more: () => React.ReactNode;
}

interface SourcePickerItemProps {
  selected: boolean
  element: SourcePickerContent
  setSelected: (s: string) => void;
}

const SourcePickerItem = ({selected: isSelected, element, setSelected}: SourcePickerItemProps) => {
  
  return <VStack minW="100%" as="button" _hover={{ bg: isSelected ? "gray.500" : "gray.700" }} 
    bg={isSelected ? "gray.500" : "none"} p="1" borderRadius={"md"} onClick={() => setSelected(element.id)}>
    <QudSpriteRenderer minH="48px" sprite={element.render}/>
    <Text>{applyQudShader(element.render.displayName)}</Text>
    {element.more()}
  </VStack>
}

export const SourcePicker = ({open, title, setOpen, onSave, contents}: AtzmusSourcePickerProps) => {

    const [selected, setSelected] = useState<string | undefined>();

    useEffect(() => {
      if (open) {
        setSelected(undefined);
      }
    }, [open]);

    const smallScreen = useBreakpointValue({ base: true, md: false });

    return (
      <DialogRoot lazyMount open={open} onOpenChange={(e) => setOpen(e.open)} size="xl" scrollBehavior={"inside"}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Grid templateColumns={`repeat(${smallScreen ? 3 : 5}, 1fr)`} templateRows={"1fr min-content"} gap="4" justifyItems={"center"}>
                {contents.map(e => (<SourcePickerItem element={e} selected={e.id === selected} setSelected={setSelected}/>))}
            </Grid>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogActionTrigger>
            <Button onClick={() => {onSave(selected); setOpen(false)}}>Save</Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    )
  }