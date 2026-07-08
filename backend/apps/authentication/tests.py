from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthenticationTests(APITestCase):
    def test_password_length_validation(self):
        response = self.client.post(
            reverse("authentication:register"),
            {
                "username": "shortpass",
                "email": "shortpass@example.com",
                "password": "1234567",
                "password_confirm": "1234567",
                "first_name": "Short",
                "last_name": "Pass",
                "role": "vendor",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Password must be between 8 and 10 characters long.", str(response.data))

    def test_register_and_login_flow(self):
        register_url = reverse("authentication:register")
        login_url = reverse("authentication:login")
        profile_url = reverse("authentication:profile")

        response = self.client.post(
            register_url,
            {
                "username": "vendor1",
                "email": "vendor1@example.com",
                "password": "Abc12345",
                "password_confirm": "Abc12345",
                "first_name": "Vendor",
                "last_name": "One",
                "role": "vendor",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="vendor1").exists())

        response = self.client.post(
            login_url,
            {"username": "vendor1", "password": "StrongPass123!"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        profile_response = self.client.get(profile_url)
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data["username"], "vendor1")
