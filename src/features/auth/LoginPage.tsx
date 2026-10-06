import { Alert, Button, Field, Flex, HStack, IconButton, Input, Stack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, Eye, EyeOff } from 'lucide-react'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { useSignIn } from '@/api'
import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'

import { emptyLoginForm, loginFormSchema } from './loginFormSchema'
import { LoginHeading } from './LoginHeading'
import { loginErrorMessage } from './loginErrorMessage'

// Phone gets 48 px controls, wider screens 44 px (design: 01-prijava).
const controlSize = { base: 'xl', md: 'lg' } as const

// The recipe's default border is decorative gray.200; inputs need gray.500 (4.47:1), and
// an invalid input gets a 2 px red.700 border (docs/design/docs/components.md, Forms).
const inputStyles = {
    size: controlSize,
    borderColor: 'border.emphasized',
    _invalid: { borderColor: 'border.error', borderWidth: '2px' },
} as const

// The error takes focus when it appears (accessibility.md, 01 Prijava).
function focusOnMount(node: HTMLElement | null) {
    node?.focus()
}

export function LoginPage() {
    const navigate = useNavigate()
    const headingId = useId()
    const errorId = useId()
    // Chakra's Field links an error only through aria-errormessage, which screen readers
    // support unevenly, so each input also names its error in aria-describedby.
    const usernameErrorId = useId()
    const passwordErrorId = useId()
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginFormSchema),
        defaultValues: emptyLoginForm,
        mode: 'onTouched',
    })
    const { signIn, isPending, error } = useSignIn({
        onSuccess: () => {
            void navigate(paths.home, { replace: true })
        },
    })

    const showError = error !== null && !isPending

    return (
        <Flex as="main" minH="100dvh" align="center" justify="center" p="6" bg="bg">
            <Stack asChild w="full" maxW="360px" gap="5">
                {/* method="post" keeps the password out of the URL even if script fails. */}
                <form
                    method="post"
                    noValidate
                    aria-labelledby={headingId}
                    aria-describedby={showError ? errorId : undefined}
                    onSubmit={(event) => void handleSubmit(signIn)(event)}
                >
                    <LoginHeading id={headingId} />

                    {showError && (
                        <Alert.Root
                            ref={focusOnMount}
                            id={errorId}
                            role="alert"
                            tabIndex={-1}
                            status="error"
                            borderWidth="1px"
                            borderColor="border.error"
                            p="3"
                            gap="2.5"
                        >
                            <Alert.Indicator>
                                <CircleAlert />
                            </Alert.Indicator>
                            <Alert.Description>
                                <strong>{hr.login.errorTitle}</strong> {loginErrorMessage(error)}
                            </Alert.Description>
                        </Alert.Root>
                    )}

                    <Field.Root
                        invalid={errors.username !== undefined}
                        ids={{ errorText: usernameErrorId }}
                    >
                        <Field.Label>{hr.login.username}</Field.Label>
                        <Input
                            {...register('username')}
                            aria-describedby={errors.username ? usernameErrorId : undefined}
                            autoComplete="username"
                            {...inputStyles}
                        />
                        <Field.ErrorText fontSize="caption">
                            <CircleAlert size="14" />
                            {errors.username?.message}
                        </Field.ErrorText>
                    </Field.Root>

                    <Field.Root
                        invalid={errors.password !== undefined}
                        ids={{ errorText: passwordErrorId }}
                    >
                        <Field.Label>{hr.login.password}</Field.Label>
                        <HStack w="full" gap="2">
                            <Input
                                {...register('password')}
                                aria-describedby={errors.password ? passwordErrorId : undefined}
                                type={isPasswordVisible ? 'text' : 'password'}
                                autoComplete="current-password"
                                {...inputStyles}
                            />
                            <IconButton
                                aria-label={hr.login.showPassword}
                                aria-pressed={isPasswordVisible}
                                onClick={() => {
                                    setIsPasswordVisible((isVisible) => !isVisible)
                                }}
                                variant="outline"
                                size={controlSize}
                                borderColor="border.emphasized"
                            >
                                {isPasswordVisible ? <EyeOff /> : <Eye />}
                            </IconButton>
                        </HStack>
                        <Field.ErrorText fontSize="caption">
                            <CircleAlert size="14" />
                            {errors.password?.message}
                        </Field.ErrorText>
                    </Field.Root>

                    <Button
                        type="submit"
                        loading={isPending}
                        loadingText={hr.login.submit}
                        colorPalette="blue"
                        size={controlSize}
                        mt="1"
                    >
                        {hr.login.submit}
                    </Button>
                </form>
            </Stack>
        </Flex>
    )
}
