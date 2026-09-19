import pytest
from app.agents import AGENTS

@pytest.mark.asyncio
async def test_all_16_agents_contract_compliance():
    assert len(AGENTS) == 16
    context = {"problem": "Build an AI-powered logistics routing optimization system."}

    for agent in AGENTS:
        result = await agent.run(context)
        assert result.artifact is not None
        assert isinstance(result.summary, str)
        assert len(result.summary) > 0
        context[agent.name.lower().replace(" ", "_")] = result.artifact

    print("All 16 domain agents completed contract compliance check successfully!")
