"""
unistay/exceptions.py

Wraps all DRF errors into a single consistent shape:
  { "error": "Human-readable message", "detail": {...} }

Register in settings.py:
  REST_FRAMEWORK = {
      ...
      "EXCEPTION_HANDLER": "unistay.exceptions.custom_exception_handler",
  }
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        # Unhandled exception → 500
        return Response(
            {'error': 'An unexpected error occurred. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    data = response.data

    # Flatten validation errors into a single readable string
    if isinstance(data, dict):
        messages = []
        for key, value in data.items():
            if key == 'detail':
                messages.append(str(value))
            elif isinstance(value, list):
                messages.append(f"{key}: {', '.join(str(v) for v in value)}")
            else:
                messages.append(f"{key}: {value}")
        error_msg = ' | '.join(messages) if messages else 'An error occurred.'
    elif isinstance(data, list):
        error_msg = ' | '.join(str(d) for d in data)
    else:
        error_msg = str(data)

    response.data = {
        'error': error_msg,
        'detail': data,
        'status_code': response.status_code,
    }
    return response
