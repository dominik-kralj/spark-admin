import { defineConfig } from '@chakra-ui/react'

import { alertRecipe } from './alert'
import { buttonRecipe } from './button'
import { inputRecipe } from './input'

export const recipesConfig = defineConfig({
    theme: {
        recipes: { button: buttonRecipe, input: inputRecipe },
        slotRecipes: { alert: alertRecipe },
    },
})
