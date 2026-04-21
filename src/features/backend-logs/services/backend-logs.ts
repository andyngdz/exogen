class BackendLogsService {
  onGetLogColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-danger'
      case 'warn':
        return 'text-warning'
      case 'info':
      case 'log':
      default:
        return 'text-default-500'
    }
  }

  onGetBackgroundColor(level: string) {
    switch (level) {
      case 'error':
        return 'bg-danger'
      case 'warn':
        return 'bg-warning'
      case 'info':
      case 'log':
      default:
        return 'bg-success'
    }
  }
}

export const backendLogsService = new BackendLogsService()
