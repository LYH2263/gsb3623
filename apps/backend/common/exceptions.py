from __future__ import annotations

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


def _extract_message(details, default_message: str) -> str:
    if not isinstance(details, dict):
        return default_message

    detail = details.get("detail")
    if isinstance(detail, str) and detail:
        return detail

    for key, value in details.items():
        if isinstance(value, list) and value:
            return f"{key}: {value[0]}"
        if isinstance(value, str) and value:
            return f"{key}: {value}"

    return default_message


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    request = context.get("request")
    request_id = getattr(request, "request_id", None)

    if response is None:
        return Response(
            {
                "code": "internal_error",
                "message": "服务器内部错误",
                "details": {},
                "request_id": request_id,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    default_message = response.status_text or "请求失败"
    details = response.data if isinstance(response.data, dict) else {"detail": response.data}
    message = _extract_message(details, default_message)

    code_map = {
        400: "bad_request",
        401: "unauthorized",
        403: "forbidden",
        404: "not_found",
    }
    code = code_map.get(response.status_code, "error")

    response.data = {
        "code": code,
        "message": str(message),
        "details": details,
        "request_id": request_id,
    }
    return response
