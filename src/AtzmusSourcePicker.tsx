import { Button, Grid, IconButton, Text, VStack } from "@chakra-ui/react";
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter, DialogActionTrigger, DialogCloseTrigger } from "./components/ui/dialog"
import { QudSpriteRenderer } from "./QudSpriteRenderer";
import { ExportObjectAtzmus } from "./ExportTypes";
import { applyQudShader } from "./Colours";
import { useState } from "react";

export interface AtzmusSourcePickerProps {
    open: boolean;
    setOpen: (b: boolean) => void;
    onSave: (a: ExportObjectAtzmus | undefined) => void;
    contents: ExportObjectAtzmus[];
}

export const AtzmusSourcePicker = ({open, setOpen, onSave, contents}: AtzmusSourcePickerProps) => {

    const [selected, setSelected] = useState<ExportObjectAtzmus | undefined>();

    return (
      <DialogRoot lazyMount open={open} onOpenChange={(e) => setOpen(e.open)} size="lg" scrollBehavior={"inside"}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select an atzmus source</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Grid templateColumns={"repeat(5, 1fr)"} gap="4" justifyItems={"center"}>
                {contents.map(e => (
                    <VStack>
                        <IconButton minH="max-content" _hover={{ bg: "gray.700" }} bg={e.id === selected?.id ? "gray.500" : "none"} onClick={() => setSelected(e)}>
                            <QudSpriteRenderer minH="48px" sprite={e.render}/>
                        </IconButton>
                        <Text>{applyQudShader(e.render.displayName)}</Text>
                        {e.grants.filter(g => typeof(g) === "string").map(s => <Text>{s}</Text>)}
                        {e.grants.filter(g => typeof(g) === "object").map(g => (<Text>{g.name} {g.level}</Text>))}
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