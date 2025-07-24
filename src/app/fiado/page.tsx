
import { BookUser } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FiadoPage() {
  return (
      <div className="p-4 sm:px-6 sm:py-4">
        <Card>
          <CardHeader>
            <CardTitle>Controle de Fiado</CardTitle>
            <CardDescription>
              Gerencie as contas a receber de seus clientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                <BookUser className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">O recurso de controle de fiado está em desenvolvimento.</p>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
