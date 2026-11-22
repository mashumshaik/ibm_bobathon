import pytest
import httpx

BASE_URL = "http://localhost:8000"


@pytest.mark.asyncio
async def test_health():
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{BASE_URL}/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_wards():
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{BASE_URL}/api/wards")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) > 0


@pytest.mark.asyncio
async def test_send_otp():
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/api/auth/send-otp",
            json={"phone": "9876543210"},
        )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_issues_list():
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{BASE_URL}/api/issues")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_leaderboard():
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{BASE_URL}/api/leaderboard/global")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
