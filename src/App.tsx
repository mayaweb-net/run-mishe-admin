import { Logo } from "@/components/main/logo";
import { Button } from "@/components/ui/button";

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6">
      <Logo showName size="lg" />
      <Button>ورود به پنل</Button>
    </div>
  );
}

export default App;
