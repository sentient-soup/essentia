import { PropsWithChildren } from 'react';
import { lazy, Suspense } from 'react';

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : lazy(() =>
        import('@tanstack/react-router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        }))
      );

export default function Layout({ children }: PropsWithChildren) {
  return (
    <Suspense>
      <div style={{ width: '100%', height: '100%' }}>
        {children}
        <TanStackRouterDevtools />
      </div>
    </Suspense>
  );
}
