import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GpuDetectionVersion } from '../GpuDetectionVersion'

describe('GpuDetectionVersion', () => {
  const defaultProps = {
    cuda_runtime_version: '12.2',
    nvidia_driver_version: '535.104.05'
  }

  it('renders CUDA runtime version correctly', () => {
    render(<GpuDetectionVersion {...defaultProps} />)

    expect(screen.getByText('Cuda version')).toBeInTheDocument()
    expect(screen.getByText('12.2')).toBeInTheDocument()
  })

  it('renders NVIDIA driver version correctly', () => {
    render(<GpuDetectionVersion {...defaultProps} />)

    expect(screen.getByText('Driver version')).toBeInTheDocument()
    expect(screen.getByText('535.104.05')).toBeInTheDocument()
  })

  it('displays different version numbers', () => {
    const customProps = {
      cuda_runtime_version: '11.8',
      nvidia_driver_version: '520.61.05'
    }

    render(<GpuDetectionVersion {...customProps} />)

    expect(screen.getByText('11.8')).toBeInTheDocument()
    expect(screen.getByText('520.61.05')).toBeInTheDocument()
  })

  it('has proper styling structure', () => {
    const { container } = render(<GpuDetectionVersion {...defaultProps} />)

    // Check for Card component structure
    const cardElement = container.querySelector('[data-slot="card"]')
    expect(cardElement).toBeInTheDocument()
    expect(screen.getByRole('separator')).toBeInTheDocument()

    // Check for version info styling
    const cudaVersion = screen.getByText('12.2')
    expect(cudaVersion).toHaveClass('text-sm', 'font-bold')

    const driverVersion = screen.getByText('535.104.05')
    expect(driverVersion).toHaveClass('text-sm', 'font-bold')

    // Check for labels styling
    const cudaLabel = screen.getByText('Cuda version')
    expect(cudaLabel).toHaveClass('text-foreground')

    const driverLabel = screen.getByText('Driver version')
    expect(driverLabel).toHaveClass('text-foreground')
  })
})
