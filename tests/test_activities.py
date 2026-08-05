from src import app as app_module


def test_get_activities_returns_activities(client):
    # Arrange: client fixture provides TestClient and clean state

    # Act
    response = client.get("/activities")

    # Assert
    assert response.status_code == 200
    data = response.json()
    # key activity from initial dataset should be present
    assert "Chess Club" in data
    # the returned data should match the in-memory activities keys
    assert set(data.keys()) == set(app_module.activities.keys())
