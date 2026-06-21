from pydantic import BaseModel, Field, field_validator


class ProPricing(BaseModel):
    monthly_price: int = Field(default=59000, ge=0)
    yearly_price: int = Field(default=590000, ge=0)


class ProPricingUpdate(BaseModel):
    monthly_price: int | None = Field(default=None, ge=0)
    yearly_price: int | None = Field(default=None, ge=0)


class SystemSettings(BaseModel):
    class_code_limit: int = Field(default=30, ge=1, le=500)
    pro_pricing: ProPricing = Field(default_factory=ProPricing)


class SystemSettingsUpdate(BaseModel):
    class_code_limit: int | None = Field(default=None, ge=1, le=500)
    pro_pricing: ProPricingUpdate | None = None

    @field_validator("pro_pricing")
    @classmethod
    def reject_empty_pricing(cls, value: ProPricingUpdate | None) -> ProPricingUpdate | None:
        if value is None:
            return value
        if value.monthly_price is None and value.yearly_price is None:
            return None
        return value
