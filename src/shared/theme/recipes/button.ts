import { defineRecipe } from '@chakra-ui/react'

import { onTouch } from './touch'

export const buttonRecipe = defineRecipe({
    variants: {
        variant: {
            outline: { borderColor: 'border.emphasized' },
        },
        size: {
            sm: { [onTouch]: { h: '11', minW: '11', textStyle: 'md' } },
            md: { [onTouch]: { h: '12', minW: '12', textStyle: 'md' } },
        },
    },
})
