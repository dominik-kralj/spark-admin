import { useRef, useState } from 'react'

export interface Overlay<TItem> {
    isOpen: boolean
    item: TItem | null
    /** A new key per opening gives each overlay fresh state; closing keeps it, so it animates out. */
    key: number
}

const closedOverlay = { isOpen: false, item: null, key: 0 }

function openOverlay<TItem>(item: TItem | null) {
    return (current: Overlay<TItem>): Overlay<TItem> => ({
        isOpen: true,
        item,
        key: current.key + 1,
    })
}

function closeOverlay<TItem>(current: Overlay<TItem>): Overlay<TItem> {
    return { ...current, isOpen: false }
}

/** A list page's add/edit form and delete dialog, and where focus goes after a delete. */
export function useEditAndDeleteOverlays<TItem>() {
    const [form, setForm] = useState<Overlay<TItem>>(closedOverlay)
    const [deleteDialog, setDeleteDialog] = useState<Overlay<TItem>>(closedOverlay)
    const wasDeletedRef = useRef(false)
    const afterDeleteFocusRef = useRef<HTMLButtonElement>(null)

    return {
        form,
        deleteDialog,
        /** The page's next action, which takes focus once the deleted item's buttons are gone. */
        afterDeleteFocusRef,
        openForm: (item: TItem | null) => {
            wasDeletedRef.current = false
            setForm(openOverlay(item))
        },
        closeForm: () => {
            setForm(closeOverlay)
        },
        openDeleteDialog: (item: TItem) => {
            wasDeletedRef.current = false
            setDeleteDialog(openOverlay(item))
        },
        closeDeleteDialog: () => {
            setDeleteDialog(closeOverlay)
        },
        finishDelete: () => {
            wasDeletedRef.current = true
            setDeleteDialog(closeOverlay)
            setForm(closeOverlay)
        },
        focusAfterDelete: () => (wasDeletedRef.current ? afterDeleteFocusRef.current : null),
    }
}
