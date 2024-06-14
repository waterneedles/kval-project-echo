import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import dotenv from "dotenv";
import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
    try {
        console.log("POST request received");

        const { userId } = auth();
        console.log("User ID:", userId);

        if (!userId) {
            console.error("[AUTH_ERROR] Unauthorized access attempt.");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        console.log("Request body:", body);

        const { messages } = body;
        console.log("Messages:", messages);

        if (!messages || !Array.isArray(messages)) {
            console.error("[REQUEST_ERROR] Invalid or missing messages.");
            return new NextResponse("Messages are required and must be an array", { status: 400 });
        }

        const freeTrial = await checkApiLimit();

        if (!freeTrial) {
            return new NextResponse("Free tries have expired!", { status: 403 });
        }

        if (!openai.apiKey) {
            console.error("[CONFIG_ERROR] OpenAI API Key not configured.");
            return new NextResponse("OpenAI API Key not configured", { status: 500 });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages
        });

        await increaseApiLimit();

        console.log("OpenAI response:", response);

        return NextResponse.json(response.choices[0].message);

    } catch (error) {
        console.error("[CONVERSATION_ERROR]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
