import { defineRecipe } from '@chakra-ui/react'

export const skipNavLinkRecipe = defineRecipe({
    base: {
        // Chakra's recipe sets none, so the sticky sidebar painted over the focused link.
        _focusVisible: { zIndex: 'skipNav', boxShadow: 'md' },
    },
})
