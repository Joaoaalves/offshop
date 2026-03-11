import { CardContent, CardHeader, CardTitle, Card } from "@/components/ui/card";

interface Props {
  title: string;
  children: React.ReactNode;
}

export function FormSection({ title, children }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
