from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime

class CivicReportRequest(BaseModel):
    title: str = Field(..., description="Short title of the civic or environmental issue", example="Illegal Waste Dumping in Storm Drain")
    description: str = Field(..., description="Detailed description of the hazard or civic problem", example="Large pile of commercial plastic waste and debris blocking stormwater canal.")
    category: str = Field(..., description="Category: Waste, Roadway, Drainage, Sanitation, Energy, Greenery", example="Waste Management")
    latitude: float = Field(..., description="Geographical latitude", example=28.6139)
    longitude: float = Field(..., description="Geographical longitude", example=77.2090)
    image_url: Optional[str] = Field(None, description="Optional image URL for vision-based inspection")

class AIAnalysisResult(BaseModel):
    priority_level: str = Field(..., description="CRITICAL, HIGH, MEDIUM, or LOW", example="CRITICAL")
    severity_score: int = Field(..., ge=1, le=100, description="Severity score from 1 (minor) to 100 (catastrophic)", example=88)
    hazard_type: str = Field(..., description="Identified civic hazard taxonomy", example="Urban Drainage Blockage & Biohazard")
    recommended_action: str = Field(..., description="Recommended emergency municipal dispatch action", example="Deploy stormwater drainage clearing crew within 4 hours.")
    sustainability_impact: str = Field(..., description="Impact on urban ecology, groundwater, or emissions", example="Prevents microplastic leaching and localized street inundation.")
    actionable_tags: List[str] = Field(default_factory=list, description="Machine-readable tags", example=["Drainage", "MonsoonRisk", "PlasticHazard"])

class ImageAnalysisResponse(BaseModel):
    priority_level: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"] = Field(..., description="Assessed priority level", example="CRITICAL")
    severity_score: int = Field(..., ge=1, le=100, description="Severity score 1-100", example=88)
    issue_type: Literal["Pothole", "Garbage Dump", "Drainage", "Streetlight", "Other"] = Field(..., description="Classified issue category", example="Drainage")
    title: str = Field(..., description="Short catchy title", example="Overflowing Storm Culvert Clogged with Polyethylene")
    hazard_summary: str = Field(..., description="2-line crisp summary of the risk", example="Heavy runoff obstructed by municipal waste accumulation. Immediate street inundation and vehicle hazard imminent.")
    recommended_action: str = Field(..., description="Immediate action required by authorities", example="Dispatch stormwater vacuum clearance unit and erect temporary barricade.")
    sustainability_impact: str = Field(..., description="Environmental impact note", example="Prevents non-biodegradable plastics from leaching into groundwater aquifers.")

class ReportRecord(ImageAnalysisResponse):
    id: str = Field(..., description="Unique Report Identifier", example="CR-1050")
    latitude: float = Field(..., example=28.6139)
    longitude: float = Field(..., example=77.2090)
    timestamp: str = Field(..., example="2026-10-25T12:00:00Z")
    status: str = Field(default="OPEN", description="Current status: OPEN, IN_DISPATCH, RESOLVED", example="OPEN")
    image_filename: Optional[str] = None
    is_duplicate: bool = Field(default=False, description="Whether this report was clustered into an existing complaint", example=False)
    merged_into_report_id: Optional[str] = Field(default=None, description="Existing report ID this issue merged into", example=None)
    duplicate_count: int = Field(default=1, description="Total count of aggregated reports at this location", example=1)

class RepairVerificationResponse(BaseModel):
    issue_id: str = Field(..., description="Report Issue ID", example="CR-1049")
    verification_status: Literal["APPROVED", "REJECTED", "NEEDS_INSPECTION"] = Field(..., description="Audit verdict", example="APPROVED")
    match_accuracy_score: int = Field(..., ge=1, le=100, description="Fix quality and location match score 1-100", example=95)
    audit_summary: str = Field(..., description="2-line summary comparing the fix with original damage", example="The stormwater culvert silt and plastic debris have been entirely suctioned and cleared.\nWater runoff velocity restored with zero residual blockage.")
    contractor_payout_eligible: bool = Field(..., description="Whether contractor invoice is cleared for payment", example=True)
    report_status: str = Field(default="RESOLVED", description="Updated status in database", example="RESOLVED")

class EcoMetric(BaseModel):
    area_name: str
    air_quality_index: int
    cleanliness_score: int
    active_hazard_count: int
    carbon_offset_kg: float
    last_updated: datetime = Field(default_factory=datetime.utcnow)
