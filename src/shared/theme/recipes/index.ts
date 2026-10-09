import { defineConfig } from '@chakra-ui/react'

import { globalCss } from '../globalCss'
import { layerStyles } from '../layerStyles'
import { textStyles } from '../textStyles'

import { alertRecipe } from './alert'
import { buttonRecipe } from './button'
import { dialogRecipe } from './dialog'
import { drawerRecipe } from './drawer'
import { emptyStateRecipe } from './emptyState'
import { fieldRecipe } from './field'
import { inputRecipe } from './input'
import { linkRecipe } from './link'
import { skeletonRecipe } from './skeleton'
import { skipNavLinkRecipe } from './skipNavLink'
import { tableRecipe } from './table'
import { tabsRecipe } from './tabs'
import { toastRecipe } from './toast'

export const recipesConfig = defineConfig({
    globalCss,
    theme: {
        layerStyles,
        textStyles,
        recipes: {
            button: buttonRecipe,
            input: inputRecipe,
            link: linkRecipe,
            skeleton: skeletonRecipe,
            skipNavLink: skipNavLinkRecipe,
        },
        slotRecipes: {
            alert: alertRecipe,
            dialog: dialogRecipe,
            drawer: drawerRecipe,
            emptyState: emptyStateRecipe,
            field: fieldRecipe,
            table: tableRecipe,
            tabs: tabsRecipe,
            toast: toastRecipe,
        },
    },
})
