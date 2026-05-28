from pydantic import BaseModel, field_validator
from typing import Optional

VALID_CATEGORIES = [
    "Clothing",
    "Beauty",
    "Electronics"
]

class ForecastRequest(BaseModel):
    category: str
    weeks: int  

    @field_validator("category")
    @classmethod
    def validate_category(cls, value):
        if not value.strip():
            raise ValueError(
                "Category is required"
            )

        if value not in VALID_CATEGORIES:
            raise ValueError(
                f"Category must be one of: {', '.join(VALID_CATEGORIES)}"
            )

        return value

    @field_validator("weeks")
    @classmethod
    def validate_weeks(cls, value):
        if value < 1:
            raise ValueError(
                "Weeks must be greater than 0"
            )

        if value > 100:
            raise ValueError(
                "Weeks cannot exceed 100"
            )

        return value