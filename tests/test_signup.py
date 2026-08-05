from src import app as app_module


def test_signup_and_unregister_flow(client):
    # Arrange
    activity = "Chess Club"
    email = "newstudent@mergington.edu"
    # ensure email not already signed up
    assert email not in [e.lower() for e in app_module.activities[activity]["participants"]]

    # Act - signup
    resp_signup = client.post(f"/activities/{activity}/signup", params={"email": email})

    # Assert - signup success
    assert resp_signup.status_code == 200
    assert email in [e.lower() for e in app_module.activities[activity]["participants"]]

    # Act - unregister
    resp_unreg = client.delete(f"/activities/{activity}/signup", params={"email": email})

    # Assert - unregister success
    assert resp_unreg.status_code == 200
    assert email not in [e.lower() for e in app_module.activities[activity]["participants"]]


def test_signup_existing_student_returns_400(client):
    # Arrange: pick an existing participant
    activity = "Chess Club"
    existing = app_module.activities[activity]["participants"][0]

    # Act
    resp = client.post(f"/activities/{activity}/signup", params={"email": existing})

    # Assert
    assert resp.status_code == 400


def test_unregister_nonexistent_returns_404(client):
    # Arrange
    activity = "Chess Club"
    not_signed = "ghost@mergington.edu"
    assert not_signed not in [e.lower() for e in app_module.activities[activity]["participants"]]

    # Act
    resp = client.delete(f"/activities/{activity}/signup", params={"email": not_signed})

    # Assert
    assert resp.status_code == 404
