import { defineRecipe } from '@chakra-ui/react'

export const buttonRecipe = defineRecipe({
    variants: {
        variant: {
            outline: { borderColor: 'border.emphasized' },
        },
    },
})
