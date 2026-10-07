import { defineSlotRecipe } from '@chakra-ui/react'

export const tableRecipe = defineSlotRecipe({
    slots: ['root', 'columnHeader', 'cell'],
    base: {
        columnHeader: {
            h: '11',
            fontSize: 'caption',
            fontWeight: 'semibold',
            color: 'spark.gray.700',
            bg: 'bg.subtle',
            whiteSpace: 'nowrap',
            verticalAlign: 'middle',
        },
        cell: {
            h: '52px',
            whiteSpace: 'nowrap',
            verticalAlign: 'middle',
        },
    },
    variants: {
        variant: {
            // Rules between rows only, so the footer under the last row is not doubled.
            line: {
                columnHeader: { borderBottomWidth: '0' },
                cell: { borderBottomWidth: '0', borderTopWidth: '1px' },
            },
        },
        size: {
            md: {
                columnHeader: { px: '4', py: '0' },
                cell: { px: '4', py: '0' },
            },
        },
    },
})
