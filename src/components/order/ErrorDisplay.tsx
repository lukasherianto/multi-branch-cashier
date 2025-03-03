
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ErrorDisplayProps {
  message: string | null;
}

export const ErrorDisplay = ({ message }: ErrorDisplayProps) => {
  if (!message) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
