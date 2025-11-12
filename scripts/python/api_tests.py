#!/usr/bin/env python3
"""
End-to-end API regression checks for the club administrator backend.

The script follows the contract defined in `docs/社团管理员前端/社团管理后台.md`
and exercises the representative flows below:
 1. Authenticate and validate token lifecycle.
 2. CRUD lifecycle for members and activities.
 3. Application submission and approval.
 4. Attendance recording tied to created members and activities.
 5. Dashboard overview sanity checks.

Usage:
    C3PO_API_BASE_URL=http://localhost:9000/api \
    C3PO_ADMIN_USERNAME=admin \
    C3PO_ADMIN_PASSWORD=secret \
    python scripts/python/api_tests.py

Environment variables (all optional):
  - C3PO_API_BASE_URL: Base URL for the backend (default: http://localhost:8080/api)
  - C3PO_ADMIN_USERNAME: Username used for login (default: admin)
  - C3PO_ADMIN_PASSWORD: Password used for login (default: admin123)
  - C3PO_API_TIMEOUT:   Request timeout seconds (default: 10)

Exit codes:
  0 -> All checks passed.
  1 -> One or more checks failed.

The script prints a concise report to stdout. Set LOG_LEVEL=DEBUG to
see verbose request / response payloads.
"""
from __future__ import annotations

import json
import logging
import os
import sys
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Dict, Iterable, List, Optional

import requests
from requests import Response, Session


def _env(name: str, default: Optional[str] = None) -> Optional[str]:
    value = os.getenv(name, default)
    if value is None:
        return None
    stripped = value.strip()
    return stripped or default


def configure_logging() -> None:
    level_name = _env("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


@dataclass
class APIConfig:
    base_url: str = _env("C3PO_API_BASE_URL", "http://localhost:8080/api")
    username: str = _env("C3PO_ADMIN_USERNAME", "admin")
    password: str = _env("C3PO_ADMIN_PASSWORD", "admin123")
    timeout: float = float(_env("C3PO_API_TIMEOUT", "10"))


class APIError(RuntimeError):
    """Raised when the remote API produces an unexpected response."""


class APITestClient:
    """
    Thin wrapper above requests.Session that injects auth headers and
    provides structured logging.
    """

    def __init__(self, config: APIConfig):
        self.config = config
        self.session: Session = requests.Session()
        self.logger = logging.getLogger(self.__class__.__name__)
        self._token: Optional[str] = None

    @property
    def token(self) -> Optional[str]:
        return self._token

    def login(self) -> Dict[str, Any]:
        payload = {"identifier": self.config.username, "password": self.config.password}
        response = self.post("/auth/login", json=payload, with_auth=False)
        token = response.get("accessToken")
        if not token:
            raise APIError("Authentication succeeded but no accessToken was returned")
        self._token = token
        self.logger.debug("Authenticated as %s", self.config.username)
        return response

    def logout(self) -> Dict[str, Any]:
        # Logout is not implemented in current API; clear local token only
        self._token = None
        return {}

    def request(
        self,
        method: str,
        path: str,
        *,
        with_auth: bool = True,
        json: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        expected_status: Iterable[int] = (200,),
    ) -> Dict[str, Any]:
        url = f"{self.config.base_url.rstrip('/')}{path}"
        headers: Dict[str, str] = {}
        if with_auth and self._token:
            headers["Authorization"] = f"Bearer {self._token}"

        self.logger.debug(
            "HTTP %s %s params=%s json=%s", method.upper(), url, params, json
        )
        response: Response = self.session.request(
            method=method.upper(),
            url=url,
            json=json,
            params=params,
            headers=headers,
            timeout=self.config.timeout,
        )
        self.logger.debug("Response %s %s", response.status_code, response.text)

        if response.status_code not in set(expected_status):
            raise APIError(
                f"{method.upper()} {path} -> HTTP {response.status_code}, "
                f"expected {expected_status}. Payload: {response.text}"
            )

        if not response.text:
            return {}

        try:
            return response.json()
        except json.JSONDecodeError as exc:
            raise APIError(f"Failed to decode JSON: {exc}") from exc

    @staticmethod
    def unwrap(payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Support unified wrapper {success, data, meta, error} and plain payloads.
        Returns the business 'data' dict/object when wrapped, otherwise the payload itself.
        """
        if isinstance(payload, dict) and "success" in payload and "data" in payload:
            return payload["data"]
        return payload

    def get(self, path: str, **kwargs: Any) -> Dict[str, Any]:
        return self.request("GET", path, **kwargs)

    def post(self, path: str, **kwargs: Any) -> Dict[str, Any]:
        return self.request("POST", path, **kwargs)

    def put(self, path: str, **kwargs: Any) -> Dict[str, Any]:
        return self.request("PUT", path, **kwargs)

    def delete(self, path: str, **kwargs: Any) -> Dict[str, Any]:
        return self.request("DELETE", path, **kwargs)


def require_keys(data: Dict[str, Any], keys: Iterable[str], *, context: str) -> None:
    missing = [key for key in keys if key not in data]
    if missing:
        raise APIError(f"{context} -> missing keys: {', '.join(missing)}")


def unique_suffix() -> str:
    return uuid.uuid4().hex[:8]


@dataclass
class APITestReport:
    steps: List[str] = field(default_factory=list)
    failures: List[str] = field(default_factory=list)
    elapsed: float = 0.0

    def ok(self, message: str) -> None:
        self.steps.append(f"✅ {message}")

    def fail(self, message: str) -> None:
        self.failures.append(f"❌ {message}")

    def print(self) -> None:
        print("\n--- API Test Report ---")
        for entry in self.steps:
            print(entry)
        if self.failures:
            print("\nFailures:")
            for entry in self.failures:
                print(entry)
        print(f"\nElapsed: {self.elapsed:.2f}s")


class ClubAdminAPISuite:
    """
    Orchestrates the high-level scenarios described in the project plan.
    Each public method raises APIError when expectations are not met.
    """

    def __init__(self, client: APITestClient, report: APITestReport):
        self.client = client
        self.report = report
        self.created_members: List[int] = []
        self.created_activities: List[int] = []
        self.created_applications: List[int] = []

    def run(self) -> None:
        start = time.time()
        try:
            self._auth_flow()
            dashboard = self._dashboard_overview()
            member_id = self._member_crud_flow()
            activity_id = self._activity_crud_flow()
            self._attendance_flow(activity_id=activity_id, member_id=member_id)
            self._application_flow()
            self.client.logout()
            self.report.ok("Local logout (token cleared)")
        except APIError as exc:
            self.report.fail(str(exc))
        finally:
            self._cleanup()
            self.report.elapsed = time.time() - start

    def _auth_flow(self) -> None:
        response = self.client.login()
        require_keys(response, ("accessToken", "tokenType", "expiresIn"), context="auth/login")
        self.report.ok("Login returned accessToken/tokenType/expiresIn")

        profile = self.client.get("/auth/me")
        require_keys(profile, ("id", "username", "email", "role", "status"), context="auth/me")
        self.report.ok("Fetched current user profile via /auth/me")

        # Optional refresh flow if refreshToken is provided by backend
        refresh_token = response.get("refreshToken")
        if refresh_token:
            refreshed = self.client.post("/auth/refresh", json={"refreshToken": refresh_token}, with_auth=False)
            require_keys(refreshed, ("accessToken", "tokenType", "expiresIn"), context="auth/refresh")
            self.client._token = refreshed["accessToken"]
            self.report.ok("Access token refreshed via /auth/refresh")

    def _dashboard_overview(self) -> Dict[str, Any]:
        overview = self.client.get("/dashboard/overview")
        expected_keys = (
            "totalMembers",
            "activeMembers",
            "totalActivities",
            "pendingApplications",
            "approvalRate",
        )
        require_keys(overview, expected_keys, context="dashboard/overview")
        self.report.ok("Dashboard overview exposes expected metrics")
        return overview

    def _member_crud_flow(self) -> int:
        payload = {
            "name": f"Auto Tester {unique_suffix()}",
            "studentId": f"S{unique_suffix()}",
            "major": "Computer Science",
            "joinDate": "2024-01-01",
            "status": "active",
            "role": "member",
            "email": "auto@tester.example",
            "phone": "1234567890",
        }
        created_resp = self.client.post("/members", json=payload, expected_status=(200, 201))
        created = self.client.unwrap(created_resp)
        require_keys(created, ("id", "name", "studentId"), context="members#create")
        member_id = int(created["id"])
        self.created_members.append(member_id)
        self.report.ok(f"Created member #{member_id}")

        fetched = self.client.unwrap(self.client.get(f"/members/{member_id}"))
        if fetched.get("studentId") != payload["studentId"]:
            raise APIError("members#get -> studentId mismatch")
        self.report.ok("Fetched member matches creation payload")

        update_payload = {"status": "inactive", "role": "manager"}
        updated = self.client.unwrap(self.client.put(f"/members/{member_id}", json=update_payload))
        if updated.get("status") != "inactive":
            raise APIError("members#update -> status not updated")
        self.report.ok("Updated member status and role")

        listing = self.client.unwrap(self.client.get("/members", params={"page": 1, "pageSize": 5}))
        require_keys(listing, ("total", "items"), context="members#index")
        self.report.ok("Member list returns pagination structure")

        stats = self.client.unwrap(self.client.get("/members/stats"))
        require_keys(
            stats,
            ("total", "active", "inactive", "pending", "averageAttendance"),
            context="members#stats",
        )
        self.report.ok("Member stats endpoint exposes expected aggregates")

        return member_id

    def _activity_crud_flow(self) -> int:
        payload = {
            "name": f"Automation Activity {unique_suffix()}",
            "description": "Automated regression check",
            "startTime": "2024-02-15 19:00",
            "endTime": "2024-02-15 21:00",
            "location": "Auditorium A",
            "maxParticipants": 50,
            "status": "pending",
            "createdBy": "Automated Tester",
        }
        created_resp = self.client.post("/activities", json=payload, expected_status=(200, 201))
        created = self.client.unwrap(created_resp)
        require_keys(created, ("id", "name", "status"), context="activities#create")
        activity_id = int(created["id"])
        self.created_activities.append(activity_id)
        self.report.ok(f"Created activity #{activity_id}")

        fetched = self.client.unwrap(self.client.get(f"/activities/{activity_id}"))
        if fetched.get("name") != payload["name"]:
            raise APIError("activities#get -> name mismatch")
        self.report.ok("Fetched activity matches creation payload")

        update_payload = {"status": "approved", "location": "Auditorium B"}
        updated = self.client.unwrap(self.client.put(f"/activities/{activity_id}", json=update_payload))
        if updated.get("status") != "approved":
            raise APIError("activities#update -> status not updated")
        self.report.ok("Updated activity status and location")

        listing = self.client.unwrap(self.client.get("/activities", params={"page": 1, "pageSize": 5}))
        require_keys(listing, ("total", "items"), context="activities#index")
        self.report.ok("Activity list returns pagination structure")

        stats = self.client.unwrap(self.client.get("/activities/stats"))
        require_keys(
            stats,
            ("total", "approved", "pending", "completed"),
            context="activities#stats",
        )
        self.report.ok("Activity stats endpoint exposes expected aggregates")

        return activity_id

    def _application_flow(self) -> None:
        payload = {
            "applicantName": f"Applicant {unique_suffix()}",
            "applicantId": f"A{unique_suffix()}",
            "contactInfo": "applicant@example.com",
            "eventName": "Automation Event",
            "eventDate": "2024-03-10",
            "location": "Hall 3",
            "reason": "Automated regression coverage",
            "applicationTime": "2024-03-05 09:00",
        }
        created_resp = self.client.post("/applications", json=payload, expected_status=(200, 201))
        created = self.client.unwrap(created_resp)
        require_keys(created, ("id", "status"), context="applications#create")
        application_id = int(created["id"])
        self.created_applications.append(application_id)
        self.report.ok(f"Created application #{application_id}")

        fetched = self.client.unwrap(self.client.get(f"/applications/{application_id}"))
        if fetched.get("applicantId") != payload["applicantId"]:
            raise APIError("applications#get -> applicantId mismatch")
        self.report.ok("Fetched application matches creation payload")

        process_payload = {
            "status": "approved",
            "processorName": "Automation Bot",
            "processComment": "Approved during automated run",
        }
        processed = self.client.unwrap(self.client.put(
            f"/applications/{application_id}/process",
            json=process_payload,
        ))
        if processed.get("status") != "approved":
            raise APIError("applications#process -> status not updated")
        self.report.ok("Processed application approval")

        listing = self.client.unwrap(self.client.get("/applications", params={"page": 1, "pageSize": 5}))
        require_keys(listing, ("total", "items"), context="applications#index")
        self.report.ok("Application list returns pagination structure")

        stats = self.client.unwrap(self.client.get("/applications/stats"))
        require_keys(
            stats,
            ("total", "pending", "approved", "rejected"),
            context="applications#stats",
        )
        self.report.ok("Application stats endpoint exposes expected aggregates")

    def _attendance_flow(self, *, activity_id: int, member_id: int) -> None:
        payload = {
            "activityId": activity_id,
            "memberId": member_id,
            "status": "present",
        }
        created_resp = self.client.post("/attendance", json=payload, expected_status=(200, 201))
        created = self.client.unwrap(created_resp)
        require_keys(created, ("id", "activityId", "memberId"), context="attendance#create")
        self.report.ok("Recorded attendance for created member and activity")

        attendance = self.client.unwrap(self.client.get(f"/activities/{activity_id}/attendance"))
        require_keys(attendance, ("total", "items"), context="attendance#index")
        if not attendance["items"]:
            raise APIError("attendance#index -> expected at least one item")
        self.report.ok("Attendance list returns recent record")

    def _cleanup(self) -> None:
        # deletions should not fail the run; ignore 404 and log any other errors
        for application_id in reversed(self.created_applications):
            try:
                self.client.delete(
                    f"/applications/{application_id}", expected_status=(200, 204, 404)
                )
            except APIError as error:
                logging.getLogger(self.__class__.__name__).warning(
                    "Failed to delete application %s: %s", application_id, error
                )
        for activity_id in reversed(self.created_activities):
            try:
                self.client.delete(
                    f"/activities/{activity_id}", expected_status=(200, 204, 404)
                )
            except APIError as error:
                logging.getLogger(self.__class__.__name__).warning(
                    "Failed to delete activity %s: %s", activity_id, error
                )
        for member_id in reversed(self.created_members):
            try:
                self.client.delete(
                    f"/members/{member_id}", expected_status=(200, 204, 404)
                )
            except APIError as error:
                logging.getLogger(self.__class__.__name__).warning(
                    "Failed to delete member %s: %s", member_id, error
                )


def main() -> int:
    configure_logging()
    config = APIConfig()
    report = APITestReport()
    client = APITestClient(config)
    suite = ClubAdminAPISuite(client, report)

    logging.getLogger(__name__).info(
        "Starting club admin API regression suite against %s", config.base_url
    )
    suite.run()
    report.print()
    if report.failures:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())


