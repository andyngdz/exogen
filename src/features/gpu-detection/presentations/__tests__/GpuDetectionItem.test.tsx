import { GpuInfo } from '@/types'
import { RadioGroup } from '@heroui/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GpuDetectionItem } from '../GpuDetectionItem'

// Mock the formatter service
vi.mock('@/services', () => ({
  formatter: {
    bytes: vi.fn(
      (bytes: number) => `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
    )
  }
}))

// Wrapper component to provide RadioGroup context
const RadioGroupWrapper = ({ children }: { children: React.ReactNode }) => (
  <RadioGroup>{children}</RadioGroup>
)

describe('GpuDetectionItem', () => {
  const mockGpu: GpuInfo = {
    name: 'NVIDIA GeForce RTX 4090',
    memory: 25769803776, // 24 GB in bytes
    cuda_compute_capability: '8.9',
    is_primary: true
  }

  it('renders GPU name correctly', () => {
    render(
      <RadioGroupWrapper>
        <GpuDetectionItem gpu={mockGpu} value="0" />
      </RadioGroupWrapper>
    )

    expect(screen.getByText('NVIDIA GeForce RTX 4090')).toBeInTheDocument()
  })

  it('renders CUDA compute capability', () => {
    render(
      <RadioGroupWrapper>
        <GpuDetectionItem gpu={mockGpu} value="0" />
      </RadioGroupWrapper>
    )

    expect(screen.getByText('Cuda compute capability')).toBeInTheDocument()
    expect(screen.getByText('8.9')).toBeInTheDocument()
  })

  it('renders formatted memory size', () => {
    render(
      <RadioGroupWrapper>
        <GpuDetectionItem gpu={mockGpu} value="0" />
      </RadioGroupWrapper>
    )

    expect(screen.getByText('24.0 GB')).toBeInTheDocument()
  })

  it('renders with different GPU data', () => {
    const differentGpu: GpuInfo = {
      name: 'NVIDIA GeForce GTX 1080',
      memory: 8589934592, // 8 GB in bytes
      cuda_compute_capability: '6.1',
      is_primary: false
    }

    render(
      <RadioGroupWrapper>
        <GpuDetectionItem gpu={differentGpu} value="1" />
      </RadioGroupWrapper>
    )

    expect(screen.getByText('NVIDIA GeForce GTX 1080')).toBeInTheDocument()
    expect(screen.getByText('6.1')).toBeInTheDocument()
    expect(screen.getByText('8.0 GB')).toBeInTheDocument()
  })

  it('passes through additional props to Radio component', () => {
    render(
      <RadioGroupWrapper>
        <GpuDetectionItem
          gpu={mockGpu}
          value="0"
          isDisabled={true}
          data-testid="gpu-radio"
        />
      </RadioGroupWrapper>
    )

    const radioElement = screen.getByRole('radio')
    expect(radioElement).toBeDisabled()
    expect(radioElement).toHaveAttribute('value', '0')
  })

  it('has correct styling classes', () => {
    render(
      <RadioGroupWrapper>
        <GpuDetectionItem gpu={mockGpu} value="0" />
      </RadioGroupWrapper>
    )

    const gpuName = screen.getByText('NVIDIA GeForce RTX 4090')
    expect(gpuName).toHaveClass('font-bold')

    const memoryText = screen.getByText('24.0 GB')
    expect(memoryText).toHaveClass('text-sm', 'text-foreground', 'font-medium')
  })
})
