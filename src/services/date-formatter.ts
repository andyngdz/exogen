import dayjs from 'dayjs'

class DateFormatter {
  time(value: string) {
    return dayjs(value).format('HH:mm')
  }

  timeFromTimestamp(value: number) {
    return dayjs(new Date(value).toISOString()).format('HH:mm')
  }

  date(value: string) {
    return dayjs(value).format('MMM D, YYYY')
  }

  datetime(value: string) {
    return dayjs(value).format('MMM D, YYYY [at] HH:mm')
  }
}

export const dateFormatter = new DateFormatter()
