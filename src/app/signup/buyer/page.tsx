import { Suspense } from 'react'
import BuyerSignupPage from './BuyerSignupPage'

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <BuyerSignupPage />
    </Suspense>
  )
}
