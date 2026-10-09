import { defineRecipe } from '@chakra-ui/react'

export const linkRecipe = defineRecipe({
    base: {
        color: 'spark.link',
        textDecoration: 'underline',
        _hover: { color: 'spark.linkHover' },
    },
})
