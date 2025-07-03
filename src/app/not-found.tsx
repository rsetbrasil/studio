import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Página não encontrada
        </h2>
        <p className="text-muted-foreground">
          A página que você está tentando acessar não existe ou foi movida.
        </p>
        <Button asChild>
          <Link href="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Link>
        </Button>
      </div>
    </div>
  )
}
