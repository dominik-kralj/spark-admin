import { defineRecipe } from '@chakra-ui/react'

export const skeletonRecipe = defineRecipe({
    base: {
        _motionReduce: { animation: 'none' },
    },
})
