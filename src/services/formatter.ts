class Formatter {
  numberFormat = Intl.NumberFormat('en-US')

  number(value: number) {
    return this.numberFormat.format(value)
  }

  bytes(value: number, decimals = 2) {
    if (value === 0) return '0 B'

    const k = 1024
    const dm = Math.max(0, decimals)
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(value) / Math.log(k))

    return `${Number.parseFloat((value / k ** i).toFixed(dm))} ${sizes[i]}`
  }
}

export const formatter = new Formatter()
