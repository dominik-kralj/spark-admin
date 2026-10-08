import { defineConfig } from '@chakra-ui/react'

import { layerStyles } from '../layerStyles'

import { alertRecipe } from './alert'
import { buttonRecipe } from './button'
import { emptyStateRecipe } from './emptyState'
import { inputRecipe } from './input'
import { skeletonRecipe } from './skeleton'
import { skipNavLinkRecipe } from './skipNavLink'
import { tableRecipe } from './table'

export const recipesConfig = defineConfig({
    theme: {
        layerStyles,
        recipes: {
            button: buttonRecipe,
            input: inputRecipe,
            skeleton: skeletonRecipe,
            skipNavLink: skipNavLinkRecipe,
        },
        slotRecipes: { alert: alertRecipe, emptyState: emptyStateRecipe, table: tableRecipe },
    },
})
