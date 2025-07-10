import { NextRequest, NextResponse } from 'next/server';
import { StateGraph } from '@/lib/state-graph';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

/**
 * Multi-Agent Travel Planning Orchestration Engine
 * Implements the PRD specifications with StateGraph routing and tool integration
 */
export async function POST(request: NextRequest) {
  try {
    const preferences = await request.json();

    // Validate required fields
    if (!preferences.destination || !preferences.budget || !preferences.startDate || 
        !preferences.endDate || !preferences.travelers || !preferences.interests) {
      return NextResponse.json(
        { error: 'Missing required fields. Please provide all travel preferences.' },
        { status: 400 }
      );
    }

    console.log('🚀 Starting Multi-Agent Travel Planning Orchestration');
    console.log('📋 Preferences:', preferences);

    // Initialize StateGraph with configuration
    const stateGraph = new StateGraph({
      recursionLimit: 150,
      timeout: 300000, // 5 minutes
      enableTools: true
    });

    console.log('🔧 StateGraph initialized with agents:', stateGraph.getState().agents);
    console.log('🛠️ Available tools:', stateGraph.getState().tools);

    // Execute the multi-agent workflow
    const finalState = await stateGraph.execute(preferences, 'city-selector');

    console.log('✅ Multi-Agent Orchestration Complete');
    console.log('📊 Final State:', {
      steps: finalState.step,
      agents: Object.keys(finalState.data),
      toolCalls: finalState.toolCalls.length,
      isComplete: finalState.isComplete
    });

    // Extract results from agent data
    const cityData = finalState.data['city-selector'];
    const localData = finalState.data['local-expert'];
    const itineraryData = finalState.data['travel-concierge'];

    // Return structured response matching PRD specifications
    return NextResponse.json({
      success: true,
      orchestration: {
        steps: finalState.step,
        agents_executed: Object.keys(finalState.data),
        tool_calls: finalState.toolCalls.length,
        execution_time: (finalState.messages && finalState.messages.length >= 2)
          ? (finalState.messages[finalState.messages.length - 1]?.timestamp ?? 0) - (finalState.messages[0]?.timestamp ?? 0)
          : null
      },
      recommendations: cityData?.alternatives || [],
      itinerary: {
        destination: cityData?.selectedCity || preferences.destination,
        localInsights: localData?.insights || [],
        schedule: itineraryData?.schedule || [],
        budget: itineraryData?.totalBudget || { total: '$0', daily: '$0', breakdown: {} }
      },
      workflow_data: {
        city_analysis: cityData,
        local_insights: localData,
        travel_logistics: itineraryData,
        tool_results: finalState.toolCalls
      }
    });

  } catch (error) {
    console.error('❌ Multi-Agent Orchestration Error:', error);
    return NextResponse.json(
      {
        error: 'Multi-agent orchestration failed',
        details: error instanceof Error ? error.message : 'Unknown orchestration error',
        type: 'orchestration_error'
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint for the orchestration engine
 */
export async function GET(request: NextRequest) {
  try {
    const stateGraph = new StateGraph();
    const state = stateGraph.getState();
    
    return NextResponse.json({
      status: 'healthy',
      engine: 'Multi-Agent Travel Planning Orchestration',
      version: '1.0.0',
      agents: state.agents,
      tools: state.tools,
      config: state.config,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}