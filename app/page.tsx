import { redirect } from 'next/navigation'

// Interim: the marketing landing page is built in Phase 4 (Task 4.3).
// Until then, send visitors straight to the editor.
export default function Home() {
  redirect('/editor')
}
