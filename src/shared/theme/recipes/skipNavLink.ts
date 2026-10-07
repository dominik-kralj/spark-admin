import { defineRecipe } from '@chakra-ui/react'

export const skipNavLinkRecipe = defineRecipe({
    base: {
        // Chakra's recipe floats it at 24 px with no z-index, half over the logo link.
        _focusVisible: {
            zIndex: 'skipNav',
            top: '0',
            insetX: '0',
            margin: '0',
            minH: { base: '14', md: '16' },
            alignItems: 'center',
            px: { base: '4', md: '6' },
            borderRadius: '0',
            // Pulls the theme's ring inside, since the link now touches the viewport edges.
            outlineOffset: '-4px',
        },
    },
})
