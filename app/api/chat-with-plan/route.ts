import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CacheManager, CACHE_KEYS } from '@/lib/redis';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { planId, message, currentPlan, chatHistory } = await request.json();

    if (!planId || !message || !currentPlan) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Build context from current plan
    const planContext = `
Current Travel Plan:
- Destination: ${currentPlan.itinerary?.destination || 'Unknown'}
- Budget: ${currentPlan.travel_logistics?.totalBudget?.amount || 'Unknown'}
- Schedule: ${JSON.stringify(currentPlan.travel_logistics?.schedule || [])}
- Local Insights: ${JSON.stringify(currentPlan.local_insights?.insights || [])}
- Recommendations: ${JSON.stringify(currentPlan.city_analysis?.alternatives || [])}
`;

    // Build chat history context
    const chatContext = chatHistory?.slice(-5).map((msg: any) => 
      `${msg.role}: ${msg.content}`
    ).join('\n') || '';

    const prompt = `
You are a helpful AI travel assistant. The user has a travel plan and wants to modify it.

${planContext}

Recent conversation:
${chatContext}

User's new message: "${message}"

Please respond helpfully and suggest specific modifications if requested. If the user wants to change something specific about their plan, provide detailed suggestions.

Also suggest 3-5 quick follow-up questions or actions the user might want to take, formatted as an array.

Respond in JSON format:
{
  "response": "Your helpful response here",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "planModified": false,
  "modifications": {}
}
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const response = await result.response;
    const aiResponse = JSON.parse(await response.text());

    // Cache the chat message
    await CacheManager.addToList(CACHE_KEYS.CHAT_HISTORY(planId), {
      role: 'user',
      content: message,
      timestamp: Date.now()
    });

    await CacheManager.addToList(CACHE_KEYS.CHAT_HISTORY(planId), {
      role: 'assistant',
      content: aiResponse.response,
      timestamp: Date.now()
    });

    return NextResponse.json({
      success: true,
      response: aiResponse.response,
      suggestions: aiResponse.suggestions || [],
      updatedPlan: aiResponse.planModified ? aiResponse.modifications : null
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}