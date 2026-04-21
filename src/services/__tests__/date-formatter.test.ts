import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'
import { dateFormatter } from '../date-formatter'

describe('dateFormatter', () => {
  describe('time', () => {
    it('formats an ISO string as HH:mm in the local timezone', () => {
      const isoString = '2024-01-15T14:30:45Z'
      const expected = dayjs(isoString).format('HH:mm')

      expect(dateFormatter.time(isoString)).toBe(expected)
    })

    it('returns Invalid Date for unparsable input', () => {
      expect(dateFormatter.time('not-a-date')).toBe('Invalid Date')
    })
  })

  describe('timeFromTimestamp', () => {
    it('mirrors time() when given equivalent timestamp', () => {
      const isoString = '2024-01-15T14:30:45Z'
      const timestamp = new Date(isoString).getTime()

      expect(dateFormatter.timeFromTimestamp(timestamp)).toBe(
        dateFormatter.time(isoString)
      )
    })

    it('throws RangeError for NaN timestamp', () => {
      expect(() => dateFormatter.timeFromTimestamp(Number.NaN)).toThrow(
        'Invalid time value'
      )
    })
  })

  describe('date', () => {
    it('formats an ISO string as a readable calendar date', () => {
      const isoString = '2024-01-15T14:30:45Z'
      const expected = dayjs(isoString).format('MMM D, YYYY')

      expect(dateFormatter.date(isoString)).toBe(expected)
    })

    it('returns Invalid Date for unparsable input', () => {
      expect(dateFormatter.date('not-a-date')).toBe('Invalid Date')
    })
  })

  describe('datetime', () => {
    it('formats an ISO string as date and time', () => {
      const isoString = '2024-01-15T14:30:45Z'
      const expected = dayjs(isoString).format('MMM D, YYYY [at] HH:mm')

      expect(dateFormatter.datetime(isoString)).toBe(expected)
    })

    it('returns Invalid Date for unparsable input', () => {
      expect(dateFormatter.datetime('not-a-date')).toBe('Invalid Date')
    })
  })
})
