import { HStack, IconButton, Input, type InputProps } from '@chakra-ui/react'
import { Eye, EyeOff } from 'lucide-react'
import { useState, type Ref } from 'react'

interface SecretInputProps extends Omit<InputProps, 'type'> {
    /** The toggle's name; aria-pressed tells whether the value is shown. */
    showLabel: string
    ref?: Ref<HTMLInputElement>
}

/** A masked input with a button beside it that shows and hides the value. */
export function SecretInput({ showLabel, ref, ...inputProps }: SecretInputProps) {
    const [isVisible, setIsVisible] = useState(false)

    return (
        <HStack w="full" gap="2">
            <Input ref={ref} {...inputProps} type={isVisible ? 'text' : 'password'} />
            <IconButton
                aria-label={showLabel}
                aria-pressed={isVisible}
                onClick={() => {
                    setIsVisible((wasVisible) => !wasVisible)
                }}
                variant="outline"
            >
                {isVisible ? <EyeOff /> : <Eye />}
            </IconButton>
        </HStack>
    )
}
