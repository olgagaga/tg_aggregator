import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { FeedProvider } from '@/context/FeedContext';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import BookmarksPage from '@/pages/BookmarksPage';
import SettingsPage from '@/pages/SettingsPage';
import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

console.log('[DEBUG] App.tsx: QueryClient created', queryClient);

function App() {
  console.log('[DEBUG] App.tsx: Rendering App component');
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
            <Toaster />
          </Router>
        </FeedProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
