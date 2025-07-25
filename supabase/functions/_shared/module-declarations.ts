
declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module 'https://deno.land/std@0.190.0/http/server.ts' {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module 'https://deno.land/x/xhr@0.1.0/mod.ts' {
  export {};
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export function createClient(url: string, key: string, options?: any): any;
  export * from 'https://esm.sh/@supabase/supabase-js@2';
}

declare module 'https://esm.sh/@supabase/supabase-js@2.45.0' {
  export function createClient(url: string, key: string, options?: any): any;
  export * from 'https://esm.sh/@supabase/supabase-js@2.45.0';
}

declare module 'https://esm.sh/@supabase/supabase-js@2.49.9' {
  export function createClient(url: string, key: string, options?: any): any;
  export * from 'https://esm.sh/@supabase/supabase-js@2.49.9';
}

declare module 'https://esm.sh/stripe@14.21.0' {
  export default class Stripe {
    constructor(apiKey: string, options?: any);
    customers: any;
    subscriptions: any;
    prices: any;
    checkout: {
      sessions: any;
    };
    billingPortal: {
      sessions: any;
    };
  }
}

declare module 'https://deno.land/std@0.168.0/http/cors.ts' {
  export const corsHeaders: Record<string, string>;
}
