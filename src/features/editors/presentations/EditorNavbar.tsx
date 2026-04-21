import ExoGenLogo from '@/assets/logo.png'
import { ModelSearchOpenIconButton } from '@/features/model-search'
import { ModelSelector } from '@/features/model-selectors/presentations/ModelSelector'
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from '@heroui/react'
import NextImage from 'next/image'

export const EditorNavbar = () => {
  return (
    <Navbar maxWidth="full" isBordered isBlurred>
      <NavbarBrand>
        <NextImage
          src={ExoGenLogo}
          alt="ExoGen Logo"
          width={32}
          height={32}
          priority
        />
      </NavbarBrand>
      <NavbarContent justify="center">
        <NavbarItem className="flex items-center gap-2">
          <ModelSelector />
          <ModelSearchOpenIconButton />
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end" />
    </Navbar>
  )
}
