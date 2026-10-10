import { defineRecipe } from '@chakra-ui/react'

import { onTouch } from './touch'

export const inputRecipe = defineRecipe({
    base: {
        // Whole numbers are typed, not stepped: the spin buttons would only crowd the field.
        '&[type=number]': {
            appearance: 'textfield',
            '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                appearance: 'none',
                margin: 0,
            },
        },
    },
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
