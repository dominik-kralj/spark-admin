import { Alert, Box, Button, Flex, Input, Stack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, Info } from 'lucide-react'
import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate, useSearchParams } from 'react-router'

import { useStrings } from '@/shared/i18n/useStrings'
import { focusOnMount } from '@/shared/lib/focusOnMount'
import { FormField } from '@/shared/ui/FormField'
import { LanguageMenu } from '@/shared/ui/LanguageMenu'
import { SecretInput } from '@/shared/ui/SecretInput'

import { useAuth } from '../api/useAuth'
import { loginErrorMessage } from '../lib/loginErrorMessage'
import { isSessionExpiredState, returnPathFrom } from '../lib/sessionRedirects'
import { emptyLoginForm, loginFormSchema } from '../validators/loginForm'

import { LoginHeading } from './LoginHeading'

export function LoginPage() {
    const t = useStrings()
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const headingId = useId()
    const errorId = useId()
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginFormSchema),
        defaultValues: emptyLoginForm,
        mode: 'onTouched',
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

                    <FormField
                        label={t.login.username}
                        error={errors.username && t.login.usernameRequired}
                    >
                        {(control) => (
                            <Input {...register('username')} {...control} autoComplete="username" />
                        )}
                    </FormField>

                    <FormField
                        label={t.login.password}
                        error={errors.password && t.login.passwordRequired}
                    >
                        {(control) => (
                            <SecretInput
                                {...register('password')}
                                {...control}
                                showLabel={t.login.showPassword}
                                autoComplete="current-password"
                            />
                        )}
                    </FormField>

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
                <LanguageMenu variant="compact" />
            </Box>
        </Flex>
    )
}
