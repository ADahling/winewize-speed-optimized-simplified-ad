
declare global {
  namespace Deno {
    export const env: {
      get(key: string): string | undefined;
    };
  }
}

export {};
