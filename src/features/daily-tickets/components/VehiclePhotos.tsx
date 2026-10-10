import {
    AspectRatio,
    chakra,
    CloseButton,
    Dialog,
    Image,
    Portal,
    SimpleGrid,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react'
import { ImageOff } from 'lucide-react'
import { useId, useState } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'

import type { VehiclePhoto } from '../validators/dailyTicket'

// The inspector app's photos are 4:3; the size reserves their space before they load.
const photoWidth = 800
const photoHeight = 600

interface PhotoTileProps {
    photo: VehiclePhoto
    alt: string
    enlargeLabel: string
    onEnlarge: () => void
}

function PhotoTile({ photo, alt, enlargeLabel, onEnlarge }: PhotoTileProps) {
    const t = useStrings()
    const [isBroken, setIsBroken] = useState(false)
    const imageId = useId()

    if (isBroken) {
        return (
            <AspectRatio ratio={4 / 3}>
                <VStack
                    gap="1"
                    p="2"
                    bg="bg.subtle"
                    borderWidth="1px"
                    borderRadius="md"
                    color="fg.muted"
                    textStyle="xs"
                    textAlign="center"
                >
                    <ImageOff size="20" aria-hidden="true" />
                    <Text>{t.dailyTickets.detail.photos.unavailable}</Text>
                </VStack>
            </AspectRatio>
        )
    }

    return (
        <chakra.button
            type="button"
            aria-label={enlargeLabel}
            // The label replaces the image's alt as the name; this keeps the alt as its description.
            aria-describedby={imageId}
            onClick={onEnlarge}
            // A button only shrinks to fit, even as a block; the 4:3 frame sizes from this width.
            display="block"
            w="full"
            borderWidth="1px"
            borderRadius="md"
            overflow="hidden"
            cursor="zoom-in"
            bg="bg.subtle"
        >
            <AspectRatio ratio={4 / 3}>
                <Image asChild objectFit="cover">
                    <img
                        id={imageId}
                        src={photo.url}
                        alt={alt}
                        width={photoWidth}
                        height={photoHeight}
                        loading="lazy"
                        decoding="async"
                        onError={() => {
                            setIsBroken(true)
                        }}
                    />
                </Image>
            </AspectRatio>
        </chakra.button>
    )
}

interface PhotoViewerProps {
    photo: VehiclePhoto | undefined
    title: string
    alt: string
    onClose: () => void
}

function PhotoViewer({ photo, title, alt, onClose }: PhotoViewerProps) {
    const t = useStrings()

    return (
        <Dialog.Root
            open={photo !== undefined}
            onOpenChange={({ open }) => {
                if (!open) onClose()
            }}
            size={{ base: 'full', md: 'xl' }}
            placement="center"
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>{title}</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton aria-label={t.dailyTickets.detail.photos.closeViewer} />
                        </Dialog.CloseTrigger>

                        <Dialog.Body pb="6">
                            {photo !== undefined && (
                                <AspectRatio ratio={4 / 3}>
                                    <Image asChild objectFit="contain" borderRadius="md">
                                        <img
                                            src={photo.url}
                                            alt={alt}
                                            width={photoWidth}
                                            height={photoHeight}
                                        />
                                    </Image>
                                </AspectRatio>
                            )}
                        </Dialog.Body>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

interface VehiclePhotosProps {
    plate: string
    photos: VehiclePhoto[]
}

export function VehiclePhotos({ plate, photos }: VehiclePhotosProps) {
    const t = useStrings()
    const strings = t.dailyTickets.detail.photos
    const [openIndex, setOpenIndex] = useState<number>()
    const total = photos.length

    if (total === 0) return <Text color="fg.muted">{strings.none}</Text>

    const shownIndex = (openIndex ?? 0) + 1

    return (
        <Stack gap="3">
            <SimpleGrid as="ul" columns={3} gap="3" listStyleType="none">
                {photos.map((photo, index) => (
                    <li key={photo.id}>
                        <PhotoTile
                            photo={photo}
                            alt={strings.alt(plate, index + 1, total)}
                            enlargeLabel={strings.enlarge(index + 1, total)}
                            onEnlarge={() => {
                                setOpenIndex(index)
                            }}
                        />
                    </li>
                ))}
            </SimpleGrid>

            <Text hideBelow="md" textStyle="sm" color="fg.muted">
                {strings.hint}
            </Text>
            <Text hideFrom="md" textStyle="sm" color="fg.muted">
                {strings.hintTouch}
            </Text>

            <PhotoViewer
                photo={openIndex === undefined ? undefined : photos[openIndex]}
                title={strings.viewerTitle(shownIndex, total)}
                alt={strings.alt(plate, shownIndex, total)}
                onClose={() => {
                    setOpenIndex(undefined)
                }}
            />
        </Stack>
    )
}
