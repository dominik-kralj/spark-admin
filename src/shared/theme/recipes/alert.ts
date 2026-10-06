import { defineSlotRecipe } from '@chakra-ui/react'

export const alertRecipe = defineSlotRecipe({
    slots: ['root'],
    variants: {
        variant: {
            subtle: { root: { borderWidth: '1px', borderColor: 'colorPalette.solid' } },
        },
        size: {
            md: { root: { px: '3', py: '3', gap: '2.5' } },
        },
    },
})
