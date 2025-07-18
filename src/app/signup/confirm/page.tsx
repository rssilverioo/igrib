import { Suspense } from 'react'
import ConfirmSignupPage from './ConfirmSignupPage'

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ConfirmSignupPage />
    </Suspense>
  )
}
