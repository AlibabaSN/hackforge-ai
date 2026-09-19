import pytest
from app.company_agents import COMPANY_AGENTS

@pytest.mark.asyncio
async def test_company_level_agents():
    assert len(COMPANY_AGENTS) == 9
    context = {"problem": "Enterprise High-Scale AI Infrastructure"}
    
    for agent in COMPANY_AGENTS:
        result = await agent.run(context)
        assert result.artifact is not None
        assert isinstance(result.summary, str)
        assert len(result.summary) > 0

    print("All 9 company-level multi-tiered agents passed execution check!")
