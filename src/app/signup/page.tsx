import { Suspense } from 'react'
import SignupPage from './SignupClient'

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SignupPage />
    </Suspense>
  )
}
