import { AppShell } from '@/features/app-shell'
import { Editor } from '@/features/editors/presentations/Editor'

export default function EditorScreen(): React.JSX.Element {
  return (
    <AppShell>
      <Editor />
    </AppShell>
  )
}
