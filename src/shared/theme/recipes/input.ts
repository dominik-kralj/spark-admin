import { defineRecipe } from '@chakra-ui/react'

import { onTouch } from './touch'

export const inputRecipe = defineRecipe({
    variants: {
        variant: {
            outline: {
                borderColor: 'border.emphasized',
                _invalid: { borderWidth: '2px' },
            },
        },
        size: {
            md: { [onTouch]: { '--input-height': 'sizes.12', textStyle: 'md' } },
        },
    },
})
