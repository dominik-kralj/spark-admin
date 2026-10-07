import { defineSlotRecipe } from '@chakra-ui/react'

export const emptyStateRecipe = defineSlotRecipe({
    slots: ['root', 'content', 'indicator', 'title', 'description'],
    base: {
        root: { bg: 'bg', borderWidth: '1px', borderColor: 'border', borderRadius: 'lg' },
        content: { textAlign: 'center' },
        indicator: { _icon: { boxSize: '7' } },
        title: { mt: '2', color: 'spark.heading' },
        description: { maxW: '420px', textStyle: 'md' },
    },
    variants: {
        size: {
            md: {
                root: { px: { base: '5', md: '6' }, py: { base: '10', md: '16' } },
                content: { gap: '2' },
            },
        },
    },
})
