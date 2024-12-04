// "use server";
"use client";

export async function sendEmail() {
    try {
        const response = await fetch("/api/send-email", {
            method: "GET",
        });
        const data = await response.json();
        console.log(data.message);
    } catch (error) {
        console.error(error);
    }
}
