import { Box, List } from "@chakra-ui/react"
import React, { useState } from "react"
import { LuSquare, LuSquareCheck } from "react-icons/lu"

export interface SelectableListItem {
    name: React.ReactNode
    more?: React.ReactNode
    onSelect?: () => void
}

export interface SelectableListProps extends List.RootProps {
    items: SelectableListItem[]
    isSelected?: (i: SelectableListItem) => boolean;
}

export const SelectableList = ({items, ...listProps}: SelectableListProps) => {

    const [selectedItem, setSelectedItem] = useState<SelectableListItem | null>(null);

    const onClick = (item: SelectableListItem) => {

        if (item === selectedItem) {
            return;
        }
        setSelectedItem(item);
        if (item.onSelect) {
            item.onSelect();
        }
    }

    return (
        <List.Root variant={"plain"} {...listProps}>
            {items.map((li, i) => {
                return (
                    <List.Item key={i} _hover={{bg: "red.700"}} 
                        _active={{ bg: "blue.900" }}
                        _focus={{ bg: "green.800" }}
                        bg={li === selectedItem ? "blue.900" : undefined }
                        onClick={() => onClick(li)}>
                        <List.Indicator asChild color="green.500">
                            {li === selectedItem ? <LuSquareCheck/> : <LuSquare/>}
                        </List.Indicator>
                        <Box>
                            {li.name}
                            {li.more}
                        </Box>

                    </List.Item>
                )
            })}
        </List.Root>
    )

}
