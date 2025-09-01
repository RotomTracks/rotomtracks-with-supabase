export default function DebugEnvPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      <div className="space-y-2">
        <p>NEXT_PUBLIC_DATABASE_URL: {process.env.NEXT_PUBLIC_DATABASE_URL ? '✅ Set' : '❌ Missing'}</p>
        <p>NEXT_PUBLIC_CLIENT_AUTH: {process.env.NEXT_PUBLIC_CLIENT_AUTH ? '✅ Set' : '❌ Missing'}</p>
        <p>SERVER_AUTH: {process.env.SERVER_AUTH ? '✅ Set' : '❌ Missing'}</p>
      </div>
    </div>
  );
}