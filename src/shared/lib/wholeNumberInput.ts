import type { InputProps } from '@chakra-ui/react'

/** Props for a whole-number input: typed, not stepped, and left alone by the wheel. */
export function wholeNumberInput(min: number): InputProps {
    return {
        type: 'number',
        min,
        step: 1,
        // A focused number input changes its value on the wheel; let the page scroll instead.
        onWheel: (event) => {
            event.currentTarget.blur()
        },
    }
}
