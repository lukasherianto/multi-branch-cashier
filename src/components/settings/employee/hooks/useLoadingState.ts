
import { useState } from "react";

export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState<string | null>(null);

  const startLoading = () => {
    setIsLoading(true);
    setError(null);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  const setLoadingError = (message: string) => {
    setError(message);
    setIsLoading(false);
  };

  return {
    isLoading,
    setIsLoading,
    error,
    setError,
    startLoading,
    stopLoading,
    setLoadingError
  };
};
