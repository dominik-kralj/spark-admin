import { defineGlobalStyles } from '@chakra-ui/react'

import { phoneTopBarHeight } from './shellSizes'

export const globalCss = defineGlobalStyles({
    // The phone top bar sticks over the page; a control scrolled into view lands below it.
    html: { scrollPaddingTop: phoneTopBarHeight },
    // Search fields bring their own named clear button; the browser's has no name and no touch size.
    'input[type="search"]::-webkit-search-cancel-button': { appearance: 'none' },
})
