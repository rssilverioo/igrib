import { Suspense } from 'react'
import SellerSignupClient from './SellerSignupClient'

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SellerSignupClient />
    </Suspense>
  )
}
