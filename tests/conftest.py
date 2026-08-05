import copy
import pytest
from fastapi.testclient import TestClient
from src import app as app_module


@pytest.fixture
def client():
    """Fixture that provides a TestClient and restores the in-memory state after each test.

    Uses Arrange-Act-Assert in tests; this fixture handles arranging shared state.
    """
    original = copy.deepcopy(app_module.activities)
    with TestClient(app_module.app) as client:
        yield client

    # Restore original activities state to keep tests isolated
    app_module.activities.clear()
    app_module.activities.update(original)
