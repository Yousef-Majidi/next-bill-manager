import Link from "next/link";
import { signOut } from "@/auth";
import { PowerIcon } from "@heroicons/react/16/solid";
import NavLinks from "./nav-links";
import { auth } from "@/auth";

export default async function SideNav() {
    const session = await auth();
    const user = session?.user;
    // console.log("session", session);

    return (
        <div className="flex h-full flex-col px-3 py-4 md:px-2">
            <Link
                className="mb-2 flex h-20 items-center justify-center rounded-md bg-gray-600 p-4"
                href={"/"}
            >
                <div className="w-32 flex justify-center text-white md:w-40">
                    {user?.name}
                </div>
            </Link>
            <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
                <NavLinks />
                <div className="hidden h-auto w-full grow rounded-md bg-gray-600 md:block"></div>
                <form
                    action={async () => {
                        "use server";
                        await signOut();
                    }}
                >
                    <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-600 p-3 text-sm font-medium hover:bg-red-500 md:flex-none md:justify-start md:p-2 md:px-3">
                        <PowerIcon className="w-6" />
                        <div className="hidden md:block">Sign Out</div>
                    </button>
                </form>
            </div>
        </div>
    );
}
