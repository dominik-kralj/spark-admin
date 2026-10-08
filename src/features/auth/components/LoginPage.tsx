import { Alert, Box, Button, Field, Flex, HStack, IconButton, Input, Stack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, Eye, EyeOff, Info } from 'lucide-react'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate, useSearchParams } from 'react-router'

import { useStrings } from '@/shared/i18n/useStrings'
import { focusOnMount } from '@/shared/lib/focusOnMount'
import { LanguageMenu } from '@/shared/ui/LanguageMenu'

import { useAuth } from '../api/useAuth'
import { loginErrorMessage } from '../lib/loginErrorMessage'
import { isSessionExpiredState, returnPathFrom } from '../lib/sessionRedirects'
import { createLoginFormSchema, emptyLoginForm } from '../validators/loginForm'

import { LoginHeading } from './LoginHeading'

export function LoginPage() {
    const t = useStrings()
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
        resolver: zodResolver(createLoginFormSchema(t)),
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
            // Anchored to the top so an error pushes only what is below it; on a phone the
            // offset puts the form (about 20rem tall) in the middle of the screen.
            pt={{ base: 'max(1.5rem, calc(50dvh - 10rem))', md: '28vh' }}
            bg="bg"
            position="relative"
        >
            <Stack asChild w="full" maxW="360px" gap="5">
                <form
                    method="post"
                    noValidate
                    aria-labelledby={headingId}
                    aria-describedby={failure ? errorId : undefined}
                    onSubmit={(event) => void handleSubmit(signIn)(event)}
                >
                    <title>{t.app.documentTitle(t.login.title)}</title>

                    <LoginHeading id={headingId} />

                    {!failure && isSessionExpiredState(location.state) && (
                        <Alert.Root role="status" status="info">
                            <Alert.Indicator>
                                <Info />
                            </Alert.Indicator>
                            <Alert.Description>{t.login.sessionExpired}</Alert.Description>
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
                                <strong>{t.login.errorTitle}</strong>{' '}
                                {loginErrorMessage(failure.error, t)}
                            </Alert.Description>
                        </Alert.Root>
                    )}

                    <Field.Root
                        invalid={errors.username !== undefined}
                        ids={{ errorText: usernameErrorId }}
                    >
                        <Field.Label>{t.login.username}</Field.Label>
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
                        <Field.Label>{t.login.password}</Field.Label>
                        <HStack w="full" gap="2">
                            <Input
                                {...register('password')}
                                aria-describedby={errors.password ? passwordErrorId : undefined}
                                type={isPasswordVisible ? 'text' : 'password'}
                                autoComplete="current-password"
                            />
                            <IconButton
                                aria-label={t.login.showPassword}
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
                        loadingText={t.login.submit}
                        colorPalette="blue"
                        mt="1"
                    >
                        {t.login.submit}
                    </Button>
                </form>
            </Stack>

            {/* Last in focus order, so the form still starts at the username. */}
            <Box position="absolute" top="4" right="4">
                <LanguageMenu variant="header" />
            </Box>
        </Flex>
    )
}
