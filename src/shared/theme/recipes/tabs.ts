import { defineSlotRecipe } from '@chakra-ui/react'

import { onTouch } from './touch'

export const tabsRecipe = defineSlotRecipe({
    slots: ['root', 'list', 'trigger'],
    base: {
        trigger: { whiteSpace: 'nowrap' },
    },
    variants: {
        variant: {
            enclosed: {
                trigger: { _selected: { color: 'spark.heading', fontWeight: 'semibold' } },
            },
        },
        size: {
            md: { root: { [onTouch]: { '--tabs-height': 'sizes.11' } } },
        },
    },
})
