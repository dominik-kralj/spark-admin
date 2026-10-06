import { defineRecipe } from '@chakra-ui/react'

export const inputRecipe = defineRecipe({
    variants: {
        variant: {
            outline: {
                borderColor: 'border.emphasized',
                _invalid: { borderWidth: '2px' },
            },
        },
    },
})
