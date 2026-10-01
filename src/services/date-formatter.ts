import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

class DateFormatter {
  time(value: string) {
    return dayjs(value).format('HH:mm')
  }

  timeFromTimestamp(value: number) {
    return dayjs(new Date(value).toISOString()).format('HH:mm')
  }

  timeWithSecondsFromTimestamp(value: number) {
    return dayjs(value).format('HH:mm:ss')
  }

  /** "2 minutes ago" style, relative to now. */
  relativeFromTimestamp(value: number) {
    return dayjs(value).fromNow()
  }

  date(value: string) {
    return dayjs(value).format('MMM D, YYYY')
  }

  datetime(value: string) {
    return dayjs(value).format('MMM D, YYYY [at] HH:mm')
  }
}

export const dateFormatter = new DateFormatter()
