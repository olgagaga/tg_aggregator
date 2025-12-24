import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FeedProvider } from '@/context/FeedContext';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import BookmarksPage from '@/pages/BookmarksPage';
import SettingsPage from '@/pages/SettingsPage';
import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FeedProvider>
        <Router>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </FeedProvider>
    </QueryClientProvider>
  );
}

export default App;
