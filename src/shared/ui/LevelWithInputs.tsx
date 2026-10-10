import { Field } from '@chakra-ui/react'

interface LevelWithInputsProps extends Field.RootProps {
    /** Never shown or read; it only takes a label's height. */
    label: string
}

/** Puts buttons in a row of fields level with the inputs, under an invisible label. */
export function LevelWithInputs({ label, children, ...rootProps }: LevelWithInputsProps) {
    return (
        <Field.Root w={{ md: 'auto' }} {...rootProps}>
            {/* Stacked below md, the buttons need no label height to match. */}
            <Field.Label hideBelow="md" aria-hidden="true" visibility="hidden">
                {label}
            </Field.Label>
            {children}
        </Field.Root>
    )
}
