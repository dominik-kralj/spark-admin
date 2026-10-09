import { defineGlobalStyles } from '@chakra-ui/react'

import { phoneTopBarHeight } from './shellSizes'

export const globalCss = defineGlobalStyles({
    // The phone top bar sticks over the page; a control scrolled into view lands below it.
    html: { scrollPaddingTop: phoneTopBarHeight },
})
