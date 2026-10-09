import { defineSlotRecipe } from '@chakra-ui/react'

import { onTouch } from './touch'

export const nativeSelectRecipe = defineSlotRecipe({
    slots: ['root', 'field'],
    variants: {
        variant: {
            outline: { field: { borderColor: 'border.emphasized' } },
        },
        size: {
            md: {
                root: { [onTouch]: { '--select-field-height': 'sizes.12' } },
                field: { [onTouch]: { textStyle: 'md' } },
            },
        },
    },
})
