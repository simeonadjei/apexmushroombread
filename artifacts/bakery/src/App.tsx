import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Layout } from '@/components/layout';
import Home from '@/pages/home';
import Order from '@/pages/order';
import Referral from '@/pages/referral';
import ReferralDashboard from '@/pages/referral-dashboard';
import TrackOrder from '@/pages/track';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/order" component={Order} />
        <Route path="/referral" component={Referral} />
        <Route path="/referral/dashboard" component={ReferralDashboard} />
        <Route path="/track" component={TrackOrder} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}

export default App;
