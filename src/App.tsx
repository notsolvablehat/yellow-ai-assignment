import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
   defaultOptions: {
      queries: {
         staleTime: 1000 * 60 * 5, // 5 minutes
         refetchOnWindowFocus: false,
      },
   },
});

function App() {
   return (
      <QueryClientProvider client={queryClient}>
         <div className="min-h-screen bg-background text-foreground">
            {/* UI components will be rendered here */}
         </div>
      </QueryClientProvider>
   );
}

export default App;
