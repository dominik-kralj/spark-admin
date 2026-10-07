import { Alert, Button, Field, Flex, HStack, IconButton, Input, Stack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, Eye, EyeOff, Info } from 'lucide-react'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate, useSearchParams } from 'react-router'

import { hr } from '@/shared/i18n/hr'
import { focusOnMount } from '@/shared/lib/focusOnMount'

import { useAuth } from '../api/useAuth'
import { loginErrorMessage } from '../lib/loginErrorMessage'
import { isSessionExpiredState, returnPathFrom } from '../lib/sessionRedirects'
import { emptyLoginForm, loginFormSchema } from '../validators/loginForm'

import { LoginHeading } from './LoginHeading'

export function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const headingId = useId()
    const errorId = useId()
    // Chakra links field errors only via aria-errormessage, so inputs add aria-describedby.
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
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })
    const { signIn, isPending, failure } = useAuth({
        onSignIn: () => {
            void navigate(returnPathFrom(searchParams), { replace: true })
        },
    })

    return (
        <Flex
            as="main"
            minH="100dvh"
            justify="center"
            p="6"
            pt={{ base: '24', md: '28vh' }}
            bg="bg"
        >
            <Stack asChild w="full" maxW="360px" gap="5">
                <form
                    method="post"
                    noValidate
                    aria-labelledby={headingId}
                    aria-describedby={failure ? errorId : undefined}
                    onSubmit={(event) => void handleSubmit(signIn)(event)}
                >
                    <title>{hr.app.documentTitle(hr.login.title)}</title>

                    <LoginHeading id={headingId} />

                    {!failure && isSessionExpiredState(location.state) && (
                        <Alert.Root role="status" status="info">
                            <Alert.Indicator>
                                <Info />
                            </Alert.Indicator>
                            <Alert.Description>{hr.login.sessionExpired}</Alert.Description>
                        </Alert.Root>
                    )}

                    {failure && (
                        <Alert.Root
                            key={failure.attempt}
                            ref={focusOnMount}
                            id={errorId}
                            role="alert"
                            tabIndex={-1}
                            status="error"
                        >
                            <Alert.Indicator>
                                <CircleAlert />
                            </Alert.Indicator>
                            <Alert.Description>
                                <strong>{hr.login.errorTitle}</strong>{' '}
                                {loginErrorMessage(failure.error)}
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
                            />
                            <IconButton
                                aria-label={hr.login.showPassword}
                                aria-pressed={isPasswordVisible}
                                onClick={() => {
                                    setIsPasswordVisible((isVisible) => !isVisible)
                                }}
                                variant="outline"
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
                        mt="1"
                    >
                        {hr.login.submit}
                    </Button>
                </form>
            </Stack>
        </Flex>
    )
}
