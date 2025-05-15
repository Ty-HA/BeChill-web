// src/app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import { handleSolanaCommand } from "@/chat/solanaCommands";

// Main function to handle chat requests
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userInput, profileName } = body;

    if (!userInput || typeof userInput !== "string") {
      return NextResponse.json(
        { error: "'userInput' parameter is required and must be a string" },
        { status: 400 }
      );
    }

    // Check if it's a Solana command
    const solanaResult = await handleSolanaCommand(userInput);

    if (solanaResult) {
      // Directly return the result for Solana commands
      return NextResponse.json({ 
        reply: solanaResult.content,
        type: solanaResult.type,
        metadata: solanaResult.metadata
      });
    }

    // If it's not a Solana command, treat it as a regular message
    // Call your usual LLM processing here
    const reply = await generateAIResponse(userInput, profileName);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Simulated function to generate an AI response
// Replace with your actual API call
async function generateAIResponse(userInput: string, profileName: string): Promise<string> {
  // Simulate a processing delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Default response - replace with your actual API call
  return `I'm CHILL and I received your message: "${userInput}". I'm responding as a "crypto assistant".`;
}
