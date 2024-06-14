"use client";

import axios from "axios";
import * as z from "zod";
import { Heading } from "@/components/heading";
import { MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import OpenAI from "openai";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { Userimage } from "@/components/userimage";
import { Aiavatar } from "@/components/aiavatar";
import { ProModal } from "@/components/promodal";
import { useProModal } from "@/hooks/usepromodal";

const ConversationPage = () => {
    const proModal = useProModal();
    const router = useRouter();
    const [messages, setMessages] = useState<OpenAI.Chat.CreateChatCompletionRequestMessage[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: ""
        }
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const userMessage: OpenAI.Chat.CreateChatCompletionRequestMessage = {
                role: "user",
                content: values.prompt,
            };
            const newMessages = [...messages, userMessage];

            console.log("Sending messages to API:", newMessages);

            const response = await axios.post("/api/conversation", { messages: newMessages });

            console.log("Received response from API:", response.data);

            setMessages((current) => [
                ...current,
                userMessage,
                { role: "assistant", content: response.data.content }
            ]);

            form.reset();
        } catch (error: any) {
            if (error?.response?.status === 403) {
                ProModal();
            }
            console.error("Error during API call:", error);
        } finally {
            router.refresh();
        }
    };

    const renderMessageContent = (content: any) => {
        if (Array.isArray(content)) {
            return content.join(' '); // Join array elements into a string
        } else if (typeof content === 'string') {
            return content; // Return string directly
        } else {
            return JSON.stringify(content); // Fallback for unexpected content types
        }
    };

    return (
        <div>
            <Heading
                title="Conversation"
                description="A smart conversation."
                icon={MessageSquare}
                iconColor="text-violet-500"
                bgColor="bg-violet-500/10"
            />
            <div className="px-4 lg:px-8">
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}
                              className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2">
                            <FormField name="prompt"
                                       render={({ field }) => (
                                           <FormItem className="col-span-12 lg:col-span-10">
                                               <FormControl className="m-0 p-0">
                                                   <Input className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                                                          disabled={isLoading}
                                                          placeholder="What is the radius of the sun?"
                                                          {...field} />
                                               </FormControl>
                                           </FormItem>
                                       )}
                            />
                            <Button className="col-span-12 lg:col-span-2 w-full" disabled={isLoading}>
                                Generate
                            </Button>
                        </form>
                    </Form>
                </div>
                <div className="space-y-4 mt-4">
                    {isLoading && (
                        <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
                            <Loader />
                        </div>
                    )}
                    {messages.length === 0 && !isLoading && (
                        <div>
                            <Empty label="No conversation started, let's talk!"/>
                        </div>
                    )}
                    <div className="flex flex-col-reverse gap-y-4">
                        {messages.map((message, index) => (
                            <div key={index} className={cn(
                                "p-8 w-full flex items-start gap-x-8 rounded-lg",
                                message.role === "user" ? "bg-white border border-black/10" : "bg-muted"
                            )}>
                                {message.role === "user" ? <Userimage /> : <Aiavatar />}
                                <p className="text-sm">
                                    {renderMessageContent(message.content)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConversationPage;
