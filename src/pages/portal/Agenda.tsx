import { CalendarDays, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Agenda() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-display font-bold text-foreground">Agenda</h1>
      </div>

      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <Badge variant="secondary" className="text-xs">Em breve</Badge>
            <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-lg font-semibold text-foreground">Agendamento de Visitas</h2>
            <p className="text-sm text-muted-foreground">
              Esta funcionalidade está sendo preparada para você. Em breve você poderá gerenciar visitas diretamente aqui.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => window.open('https://calendar.google.com', '_blank')}
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          Abrir Google Calendar
          <ExternalLink className="h-3 w-3 ml-2" />
        </Button>
      </div>
    </div>
  );
}
