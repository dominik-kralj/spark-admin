import { createToaster } from '@chakra-ui/react'

/** Success toasts close after 5 s and pause while hovered; pass `duration: Infinity` for errors. */
export const toaster = createToaster({
    placement: 'bottom-end',
    duration: 5000,
    pauseOnPageIdle: true,
})
