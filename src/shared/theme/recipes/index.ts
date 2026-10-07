import { defineConfig } from '@chakra-ui/react'

import { alertRecipe } from './alert'
import { buttonRecipe } from './button'
import { inputRecipe } from './input'
import { skipNavLinkRecipe } from './skipNavLink'

export const recipesConfig = defineConfig({
    theme: {
        recipes: { button: buttonRecipe, input: inputRecipe, skipNavLink: skipNavLinkRecipe },
        slotRecipes: { alert: alertRecipe },
    },
})
