import type { RouteObject } from 'react-router'

import { LoginPage } from '@/features/auth/LoginPage'
import { HomePage } from '@/HomePage'
import { paths } from '@/shared/paths'

export const routes: RouteObject[] = [
    { path: paths.home, Component: HomePage },
    { path: paths.login, Component: LoginPage },
]
