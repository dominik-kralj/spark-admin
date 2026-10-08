import { defineSlotRecipe } from '@chakra-ui/react'

export const fieldRecipe = defineSlotRecipe({
    slots: ['helperText', 'errorText'],
    base: {
        helperText: { fontSize: 'caption' },
        errorText: { fontSize: 'caption' },
    },
})
