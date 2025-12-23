import { useCallback, useState } from "react";

interface UseAsyncOptions<TResult> {
  onSuccess?: (result: TResult) => void;
  onError?: (error: unknown) => void;
}

export function useAsync<TArgs extends any[], TResult>(
  asyncFunction: (...args: TArgs) => Promise<TResult>,
  options: UseAsyncOptions<TResult> = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const run = useCallback(
    async (...args: TArgs) => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFunction(...args);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        setError(err);
        options.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction, options.onSuccess, options.onError]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { run, loading, error, reset };
}


