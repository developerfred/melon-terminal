import React, { Suspense, useMemo } from 'react';
import ErrorBoundary, { FallbackProps } from 'react-error-boundary';
import { hot } from 'react-hot-loader';
import { ModalProvider } from 'styled-react-modal';
import { BrowserRouter as Router } from 'react-router-dom';
import { Spinner } from './Common/Spinner/Spinner';
import { Layout } from './Layout/Layout';
import { method as metamask } from './Common/ConnectionSelector/MetaMask/MetaMask';
import { method as frame } from './Common/ConnectionSelector/Frame/Frame';
import { method as ganache } from './Common/ConnectionSelector/Ganache/Ganache';
import { Theme, ModalBackground } from './App.styles';
import { ApolloProvider } from './Contexts/Apollo/Apollo';
import { ConnectionProvider } from './Contexts/Connection/Connection';
import { AccountProvider } from './Contexts/Account/Account';
import { PageTitleProvider } from './Contexts/PageTitle/PageTitle';
// NOTE: Imported using root relative import to allow overrides with webpack.
import { AppRouter } from '~/components/AppRouter';

const AppComponent = () => {
  const methods = useMemo(() => {
    if (process.env.MELON_TESTNET) {
      return [ganache, metamask, frame];
    }

    return [metamask, frame];
  }, []);

  return (
    <Router>
      <Theme>
        <PageTitleProvider>
          <ModalProvider backgroundComponent={ModalBackground}>
            <ConnectionProvider methods={methods}>
              <ApolloProvider>
                <AccountProvider>
                  <Layout>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                      <Suspense fallback={<Spinner size="large" positioning="overlay" />}>
                        <AppRouter />
                      </Suspense>
                    </ErrorBoundary>
                  </Layout>
                </AccountProvider>
              </ApolloProvider>
            </ConnectionProvider>
          </ModalProvider>
        </PageTitleProvider>
      </Theme>
    </Router>
  );
};

const ErrorFallback: React.FC<FallbackProps> = ({ error, componentStack }) => (
  <div>
    <p>
      <strong>Oops! An error occured!</strong>
    </p>
    <p>Here’s what we know…</p>
    {error && (
      <p>
        <strong>Error:</strong> {error.toString()}
      </p>
    )}
    {componentStack && (
      <p>
        <strong>Stacktrace:</strong> {componentStack}
      </p>
    )}
  </div>
);

export const App = hot(module)(AppComponent);
