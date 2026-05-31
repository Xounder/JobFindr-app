import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './useDebounce.ts'

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 100))
    expect(result.current).toBe('hello')
  })

  it('updates after delay', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 50), {
      initialProps: { value: 'hello' },
    })

    expect(result.current).toBe('hello')

    rerender({ value: 'world' })
    expect(result.current).toBe('hello')

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    expect(result.current).toBe('world')
  })
})
