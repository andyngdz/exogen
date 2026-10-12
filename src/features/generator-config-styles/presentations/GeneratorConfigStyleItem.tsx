'use client'

import { useBackendUrl } from '@/cores/backend-initialization'
import { useGeneratorConfigStyle } from '@/features/generator-config-styles/states'
import { StyleItem } from '@/types'
import { Avatar, Chip, ChipProps, Tooltip } from '@heroui/react'
import clsx from 'clsx'
import NextImage from 'next/image'
import { FC } from 'react'
import { usePress } from 'react-aria'

export interface GeneratorConfigStyleItemProps extends Pick<
  ChipProps,
  'color' | 'variant'
> {
  styleItem: StyleItem
}

export const GeneratorConfigStyleItem: FC<GeneratorConfigStyleItemProps> = ({
  styleItem,
  color,
  variant = 'secondary'
}) => {
  const baseURL = useBackendUrl()
  const { isSelected, onClick } = useGeneratorConfigStyle(styleItem.id)
  const { pressProps } = usePress({ onPress: onClick })
  const imageUrl = `${baseURL}/static/${styleItem.image}`

  return (
    <Tooltip delay={0} closeDelay={0}>
      <Tooltip.Trigger
        {...pressProps}
        aria-label={styleItem.name}
        className="cursor-pointer"
      >
        <Chip
          color={color}
          variant={variant}
          className={clsx('transition-all', {
            'ring-2 ring-accent': isSelected
          })}
        >
          <span className="flex items-center gap-2">
            <Avatar size="sm" className="size-5">
              <Avatar.Image src={imageUrl} alt={styleItem.name} />
            </Avatar>
            <Chip.Label>{styleItem.name}</Chip.Label>
          </span>
        </Chip>
      </Tooltip.Trigger>
      <Tooltip.Content className="pointer-events-none p-0 rounded-lg overflow-hidden">
        <NextImage
          src={imageUrl}
          width={196}
          height={196}
          alt={styleItem.name}
        />
      </Tooltip.Content>
    </Tooltip>
  )
}
