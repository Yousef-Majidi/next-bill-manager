import { sendEmail } from "@/app/lib/clientActions";
import { Button } from "@/app/ui/button";
import { ArrowRightIcon } from "@heroicons/react/16/solid";

export default function Page() {
    return (
        <>
            <h1 className={`mb-4 text-xl md:text-2xl`}>Dashboard</h1>
            <Button
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-40`}
                aria-disabled={false}
                onClick={sendEmail}
            >
                Send Email{" "}
                <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
            </Button>
        </>
    );
}
