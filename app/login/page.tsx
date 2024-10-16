import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Button } from "@/app/ui/button";
import { signIn } from "@/auth";

export default function LoginPage() {
    return (
        <main className="flex items-center justify-center md:h-screen">
            <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
                <form
                    action={async () => {
                        "use server";
                        await signIn("google");
                    }}
                >
                    <Button className="mt-4 w-full" aria-disabled={false}>
                        Log in with Google{" "}
                        <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
                    </Button>
                </form>
            </div>
        </main>
    );
}
