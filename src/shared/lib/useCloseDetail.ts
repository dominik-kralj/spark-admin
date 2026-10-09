import { useLocation, useNavigate } from 'react-router'

import { wasOpenedFromList } from './detailLink'

/** Closes a detail that opens over its list, back to the list's page, sort and filters. */
export function useCloseDetail(listPath: string) {
    const navigate = useNavigate()
    const location = useLocation()

    return () => {
        // Back, so the browser's own Back does not reopen the detail.
        if (wasOpenedFromList(location.state)) {
            void navigate(-1)
            return
        }
        void navigate({ pathname: listPath, search: location.search }, { replace: true })
    }
}
