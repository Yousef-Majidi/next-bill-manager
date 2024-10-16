// "use client";

// import { lusitana } from "@/app/ui/fonts";
// import {
//     // AtSymbolIcon,
//     // KeyIcon,
//     ExclamationCircleIcon,
// } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Button } from "./button";
// import { useActionState } from "react";
// import { authenticate } from "@/app/lib/actions";

import { signIn } from "@/auth";

export default function SignIn() {
    // const [isPending] = useActionState(authenticate, undefined) || [false];
    return (
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
    );
}
