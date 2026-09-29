import ExoGenLogo from '@/assets/logo.png'
import { ModelSearchOpenIconButton } from '@/features/model-search'
import { ModelSelector } from '@/features/model-selectors/presentations/ModelSelector'
import clsx from 'clsx'
import NextImage from 'next/image'

export const EditorNavbar = () => {
  return (
    <header
      className={clsx(
        'sticky top-0 z-40',
        'flex h-16 w-full items-center gap-4',
        'border-b border-separator',
        'px-6 backdrop-blur-lg'
      )}
    >
      <div className="flex flex-1 items-center">
        <NextImage
          src={ExoGenLogo}
          alt="ExoGen Logo"
          width={32}
          height={32}
          priority
        />
      </div>
      <nav className="flex items-center gap-2">
        <ModelSelector />
        <ModelSearchOpenIconButton />
      </nav>
      <div className="flex flex-1 justify-end" />
    </header>
  )
}
