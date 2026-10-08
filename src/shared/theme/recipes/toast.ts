import { defineSlotRecipe } from '@chakra-ui/react'

export const toastRecipe = defineSlotRecipe({
    slots: ['root', 'title', 'description'],
    base: {
        root: {
            alignItems: 'flex-start',
            gap: '3',
            py: '3',
            ps: '4',
            pe: '2',
            borderWidth: '1px',
            borderRadius: 'l3',
            boxShadow: 'md',
            // Chakra's types fill the toast with colour; the design keeps a white surface.
            '&[data-type]': { bg: 'bg.panel', color: 'fg' },
            '&[data-type=success]': { borderColor: 'border.success' },
            '&[data-type=error]': { borderColor: 'border.error' },
            _motionReduce: { transition: 'none' },
        },
        title: { fontWeight: 'semibold', textStyle: 'md' },
        description: { color: 'fg.muted', opacity: '1', textStyle: 'md' },
    },
})
