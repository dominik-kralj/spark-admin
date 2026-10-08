import { defineSlotRecipe } from '@chakra-ui/react'

export const dialogRecipe = defineSlotRecipe({
    slots: ['backdrop', 'title'],
    base: {
        backdrop: { bg: 'spark.scrim' },
        title: { color: 'spark.heading' },
    },
})
