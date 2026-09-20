import pytest
from app.agents import AGENTS

@pytest.mark.asyncio
async def test_all_16_agents_contract_compliance():
    assert len(AGENTS) == 16
    context = {"problem": "Build an AI-powered logistics routing optimization system."}

    for agent in AGENTS:
        assert hasattr(agent, "model_name") and len(agent.model_name) > 0
        assert hasattr(agent, "provider_label") and len(agent.provider_label) > 0
        result = await agent.run(context)
        assert result.artifact is not None
        assert isinstance(result.summary, str)
        assert len(result.summary) > 0
        assert result.model_name == agent.model_name
        assert result.provider == agent.provider_label
        assert f"[{agent.model_name}]" in result.summary
        context[agent.name.lower().replace(" ", "_")] = result.artifact

    print("All 16 domain agents verified running open-source models with contract compliance!")
