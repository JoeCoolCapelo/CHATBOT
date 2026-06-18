import { Badge } from './Badge';

export function StatusBadge({ status }: { status: string }) {
  switch (status.toLowerCase()) {
    case 'draft':
    case 'brouillon':
      return <Badge variant="brouillon">Brouillon</Badge>;
    case 'submitted':
    case 'soumis':
      return <Badge variant="soumis">Soumis</Badge>;
    case 'pending':
    case 'en attente':
    case 'en_cours':
      return <Badge variant="en_cours" pulse>En cours</Badge>;
    case 'validated':
    case 'validé':
      return <Badge variant="valide">Validé</Badge>;
    case 'rejected':
    case 'rejeté':
      return <Badge variant="rejete">Rejeté</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}
