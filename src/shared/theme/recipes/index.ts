import { defineConfig } from '@chakra-ui/react'

import { alertRecipe } from './alert'
import { buttonRecipe } from './button'
import { emptyStateRecipe } from './emptyState'
import { inputRecipe } from './input'
import { skeletonRecipe } from './skeleton'
import { skipNavLinkRecipe } from './skipNavLink'

export const recipesConfig = defineConfig({
    theme: {
        recipes: {
            button: buttonRecipe,
            input: inputRecipe,
            skeleton: skeletonRecipe,
            skipNavLink: skipNavLinkRecipe,
        },
        slotRecipes: { alert: alertRecipe, emptyState: emptyStateRecipe },
    },
})
