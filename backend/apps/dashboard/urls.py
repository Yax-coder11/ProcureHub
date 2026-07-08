from django.urls import path

from .views import DashboardActivityView, DashboardStatsView, DashboardView

urlpatterns = [
    # ── Unified endpoint (preferred) ─────────────────────────────────────
    # Returns sidebar config, stats, activities, and quick actions in one call.
    path("", DashboardView.as_view(), name="dashboard"),

    # ── Legacy endpoints — kept so any existing integrations don't break ──
    path("stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("activity/", DashboardActivityView.as_view(), name="dashboard-activity"),
]
