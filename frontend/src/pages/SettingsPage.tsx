import FeedList from '@/components/feeds/FeedList';

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-8">
        {/* Feed Management Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Feed Management</h2>
          <FeedList />
        </section>

        {/* Future sections can go here */}
        {/* <section>
          <h2 className="text-lg font-semibold mb-4">Preferences</h2>
          <p className="text-sm text-muted-foreground">Display preferences coming soon...</p>
        </section> */}
      </div>
    </div>
  );
}
