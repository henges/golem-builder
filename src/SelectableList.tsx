import { Box, List } from "@chakra-ui/react"
import React, { ComponentProps, useState } from "react"
import { LuSquare, LuSquareCheck } from "react-icons/lu"

export interface SelectableListItem {
    name: React.ReactNode
    more?: React.ReactNode
    onSelect?: () => void
    isSelected?: boolean;
}

export interface SelectableListProps extends ComponentProps<typeof List.Root> {
    listIconUnselected?: React.ReactNode
    listIconSelected?: React.ReactNode
    items: SelectableListItem[]
}

export const SelectableList = React.forwardRef<HTMLUListElement, SelectableListProps>(({items, listIconSelected, listIconUnselected, ...listProps}, ref) => {

    const [selectedItem, setSelectedItem] = useState<SelectableListItem | null>(null);

    const onClick = (item: SelectableListItem) => {
        // if (item === selectedItem) {
        //     return;
        // }
        setSelectedItem(item);
        if (item.onSelect) {
            item.onSelect();
        }
    }

    return (
        <List.Root variant={"plain"} ref={ref} {...listProps}>
            {items.map((li, i) => {
                return (
                    <List.Item key={i} _hover={{bg: "red.700"}} px={1} 
                        _active={{ bg: "blue.900" }}
                        _focus={{ bg: "green.800" }}
                        bg={(li.isSelected !== undefined ? li.isSelected : li === selectedItem) ? "blue.900" : undefined }
                        onClick={() => onClick(li)}>
                        <List.Indicator asChild color="green.500">
                            {(li.isSelected !== undefined ? li.isSelected : li === selectedItem) ? listIconSelected || <LuSquareCheck/> : listIconUnselected || <LuSquare/>}
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
})
