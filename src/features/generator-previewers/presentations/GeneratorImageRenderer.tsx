import { isEmpty } from 'es-toolkit/compat'
import NextImage from 'next/image'
import { FC, useMemo } from 'react'
import { GeneratorImageRendererLoader } from './GeneratorImageRendererLoader'

interface GeneratorImageRendererProps {
  imagePath: string
  imageBase64: string
  imageIndex: number
  baseURL: string
}

export const GeneratorImageRenderer: FC<GeneratorImageRendererProps> = ({
  imagePath,
  imageBase64,
  imageIndex,
  baseURL
}) => {
  const ImageComponent = useMemo(() => {
    if (!isEmpty(imagePath)) {
      return (
        <NextImage
          src={`${baseURL}/${imagePath}`}
          alt={`Image ${imageIndex}`}
          className="rounded-2xl object-cover"
          fill
        />
      )
    }

    if (isEmpty(imageBase64)) {
      return <GeneratorImageRendererLoader />
    }

    const src = `data:image/png;base64,${imageBase64}`

    return (
      <NextImage
        src={src}
        alt={`Image ${imageIndex}`}
        className="rounded-2xl object-cover"
        fill
      />
    )
  }, [baseURL, imageBase64, imageIndex, imagePath])

  return ImageComponent
}
