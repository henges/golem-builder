import { Button, Grid, IconButton, Text, VStack } from "@chakra-ui/react";
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter, DialogActionTrigger, DialogCloseTrigger } from "./components/ui/dialog"
import { QudSpriteRenderer } from "./QudSpriteRenderer";
import { ExportRender } from "./ExportTypes";
import { applyQudShader } from "./Colours";
import React, { useState } from "react";

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

export const SourcePicker = ({open, title, setOpen, onSave, contents}: AtzmusSourcePickerProps) => {

    const [selected, setSelected] = useState<string | undefined>();

    return (
      <DialogRoot lazyMount open={open} onOpenChange={(e) => setOpen(e.open)} size="lg" scrollBehavior={"inside"}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {/* <DialogTitle>Select an atzmus source</DialogTitle> */}
          </DialogHeader>
          <DialogBody>
            <Grid templateColumns={"repeat(5, 1fr)"} gap="4" justifyItems={"center"}>
                {contents.map(e => (
                    <VStack>
                        <IconButton minH="max-content" _hover={{ bg: "gray.700" }} bg={e.id === selected ? "gray.500" : "none"} onClick={() => setSelected(e.id)}>
                            <QudSpriteRenderer minH="48px" sprite={e.render}/>
                        </IconButton>
                        <Text>{applyQudShader(e.render.displayName)}</Text>
                        {e.more()}
                    </VStack>
            ))}
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