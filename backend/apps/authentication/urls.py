from django.urls import path

from .views import LoginView, LogoutView, PasswordChangeView, ProfileView, RegisterView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("password-change/", PasswordChangeView.as_view(), name="password-change"),
]
