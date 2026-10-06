# KEIAN Storefront

React, TypeScript, and Vite storefront with Supabase authentication/data access
and Supabase Edge Functions for Razorpay payments.

## Project layout

```text
src/
  app/                     Application route configuration
  assets/images/           Original and optimized local images
  features/
    account/               Customer account pages and components
    admin/                 Admin pages and components
    auth/                  Customer auth pages and auth service
    cart/                  Cart page and components
    catalog/               Product listing/detail pages and components
    checkout/              Checkout page and components
    content/               Contact and story pages
    home/                  Home page and components
    orders/                Order pages, components, and domain types
  shared/
    components/            Shared layout and UI components
    lib/                   Shared external-service clients
  styles/                  Global and shared storefront styles
  main.tsx                 Browser entry point
supabase/
  functions/                Payment Edge Functions
scripts/                    Local maintenance utilities
```

Use the `@/` import alias for modules inside `src`, for example
`@/features/cart/pages/Cart`.

## Development commands

```sh
npm run dev
npm run build
npm run lint
npm run preview
```

## Storefront image assets

Large local storefront images are served as generated WebP files from
`src/assets/images/optimized`. Update the source list in
`scripts/optimize-images.mjs` and run this command after changing a source:

```sh
npm run optimize:images
```

Application routes are lazy-loaded from `src/app/AppRoutes.tsx`; the Razorpay
checkout script is loaded only when an online payment is started.
