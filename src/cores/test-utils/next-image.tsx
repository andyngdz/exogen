/**
 * Mock implementation for Next.js Image component
 * This avoids the NextJS no-img-element linting warning in tests
 */
const MockNextImage = ({
  src,
  alt,
  width,
  height,
  fill: _fill,
  priority: _priority,
  loading: _loading,
  quality: _quality,
  className,
  ...props
}: {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  fill?: boolean
  className?: string
  priority?: boolean
  loading?: 'eager' | 'lazy'
  quality?: number | string
  [key: string]: unknown
}) => {
  return (
    <div
      data-testid="mock-next-image"
      data-src={src}
      data-alt={alt}
      className={className}
      style={{
        width: width ? `${width}px` : 'auto',
        height: height ? `${height}px` : 'auto'
      }}
      {...props}
    >
      {alt}
    </div>
  )
}

/**
 * Setup function to mock the next/image module
 * Use this in your test files by calling vi.mock('next/image')
 */
export const mockNextImage = () => {
  return {
    default: MockNextImage,
    __esModule: true
  }
}
