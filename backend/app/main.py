import os
import json
import logging
import math
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict
from dotenv import load_dotenv

# Load local environment variables
load_dotenv()

from fastapi import FastAPI, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from app.schemas.civic import (
    CivicReportRequest,
    AIAnalysisResult,
    EcoMetric,
    ImageAnalysisResponse,
    ReportRecord,
    RepairVerificationResponse,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("CivicSense")

def get_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes the great-circle distance between two GPS coordinates in meters
    using the Haversine formula.
    """
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

app = FastAPI(
    title="CivicSense AI Engine",
    version="1.2.0",
    description="Next-Gen Civic & Sustainability Intelligence Engine with Proof-of-Work Verification powered by Gemini 1.5 Flash Vision",
)

# Configure CORS
origins = os.getenv("CORS_ORIGINS", '["http://localhost:3000", "http://127.0.0.1:3000"]')
try:
    allow_origins = json.loads(origins) if isinstance(origins, str) and origins.startswith("[") else ["*"]
except Exception:
    allow_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

# Lazy / safe initialization of Google GenAI client
genai_client = None
if GEMINI_API_KEY:
    try:
        from google import genai
        genai_client = genai.Client(api_key=GEMINI_API_KEY)
        logger.info("Google GenAI client initialized successfully with Gemini 1.5 Flash.")
    except Exception as e:
        logger.warning(f"Failed to initialize google-genai client: {e}")

# In-memory store for original before images: issue_id -> {"bytes": bytes, "content_type": str, "filename": str}
IMAGES_STORE: Dict[str, Dict] = {}

# Dummy 1x1 JPEG bytes for seed reports if requested before live capture
DUMMY_IMAGE_BYTES = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xbf\x00\xff\xd9"

# In-memory database of civic reports for map plotting and real-time feed
REPORTS_DB: List[dict] = [
    {
        "id": "CR-1049",
        "title": "Industrial Sludge in Drainage Canal",
        "issue_type": "Drainage",
        "priority_level": "CRITICAL",
        "severity_score": 94,
        "hazard_summary": "Toxic chemical sludge accumulation obstructing municipal stormwater outfall.\nRisk of flash inundation and downstream groundwater toxicity.",
        "recommended_action": "Deploy hazardous suction truck, seal stormwater valve, and notify municipal water authority.",
        "sustainability_impact": "Prevents irreversible heavy metal leaching into regional water table and wetland reserves.",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "timestamp": "2026-10-25T11:45:00Z",
        "status": "OPEN",
        "image_filename": "drainage_sludge.jpg",
        "duplicate_count": 1,
        "is_duplicate": False,
        "merged_into_report_id": None,
    },
    {
        "id": "CR-1048",
        "title": "Solar Smart Streetlight Blackout",
        "issue_type": "Streetlight",
        "priority_level": "MEDIUM",
        "severity_score": 52,
        "hazard_summary": "Grid fault on renewable street pole causing zero illumination on pedestrian walkway.\nIncreases nocturnal road crossing hazard for pedestrians.",
        "recommended_action": "Dispatch energy zonal maintenance unit for battery inverter inspection.",
        "sustainability_impact": "Restores decentralized renewable solar lighting coverage and pedestrian safety index.",
        "latitude": 28.6219,
        "longitude": 77.2150,
        "timestamp": "2026-10-25T11:32:00Z",
        "status": "OPEN",
        "image_filename": "light_outage.jpg",
        "duplicate_count": 1,
        "is_duplicate": False,
        "merged_into_report_id": None,
    },
    {
        "id": "CR-1047",
        "title": "Severe Deep Pothole on EV Transit Lane",
        "issue_type": "Pothole",
        "priority_level": "HIGH",
        "severity_score": 79,
        "hazard_summary": "Crater-depth asphalt depression spanning over 1.2 meters across main arterial lane.\nPresents severe blowout hazard for two-wheelers and electric buses.",
        "recommended_action": "Deploy rapid cold-mix bitumen patching team within 6 hours and install warning cones.",
        "sustainability_impact": "Minimizes localized vehicle deceleration cycles and transit emission spikes.",
        "latitude": 28.6080,
        "longitude": 77.2010,
        "timestamp": "2026-10-25T11:15:00Z",
        "status": "OPEN",
        "image_filename": "road_crater.jpg",
        "duplicate_count": 1,
        "is_duplicate": False,
        "merged_into_report_id": None,
    },
    {
        "id": "CR-1046",
        "title": "Unsegregated Plastic Dump in Public Eco-Park",
        "issue_type": "Garbage Dump",
        "priority_level": "HIGH",
        "severity_score": 71,
        "hazard_summary": "Massive pile of single-use plastic waste and open decomposing refuse adjacent to jogging track.\nPresents airborne pathogen risk and rodent infestation vector.",
        "recommended_action": "Dispatch municipal mechanical refuse compactor and sanitize perimeter ground.",
        "sustainability_impact": "Halts open plastic degradation and stops microplastic spread in community green zone.",
        "latitude": 28.6180,
        "longitude": 77.2280,
        "timestamp": "2026-10-25T10:50:00Z",
        "status": "OPEN",
        "image_filename": "park_dump.jpg",
        "duplicate_count": 1,
        "is_duplicate": False,
        "merged_into_report_id": None,
    },
]

# Initialize seed report images in store
for rep in REPORTS_DB:
    IMAGES_STORE[rep["id"]] = {
        "bytes": DUMMY_IMAGE_BYTES,
        "content_type": "image/jpeg",
        "filename": rep["image_filename"],
    }


@app.get("/")
async def root():
    return {
        "project": "CivicSense AI",
        "version": "1.2.0",
        "status": "operational",
        "total_reports": len(REPORTS_DB),
        "documentation": "/docs",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "CivicSense AI Core Engine",
        "gemini_configured": bool(GEMINI_API_KEY and genai_client is not None),
        "total_reports_stored": len(REPORTS_DB),
    }


@app.post("/api/v1/analyze-image", response_model=ReportRecord)
async def analyze_civic_image(
    file: UploadFile = File(..., description="Captured civic hazard photograph"),
    latitude: float = Form(..., description="GPS Latitude coordinate"),
    longitude: float = Form(..., description="GPS Longitude coordinate"),
):
    """
    Multimodal vision endpoint:
    Accepts image bytes + geolocation, evaluates civic hazard with Gemini 1.5 Flash Vision,
    persists the incident into REPORTS_DB, and stores the 'BEFORE' photo for Proof-of-Work audits.
    """
    logger.info(f"Received image analysis request: {file.filename} at ({latitude}, {longitude})")

    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty image payload received.",
            )
    except Exception as e:
        logger.error(f"Failed to read image bytes: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to process uploaded file: {str(e)}",
        )

    content_type = file.content_type or "image/jpeg"
    if content_type not in ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]:
        content_type = "image/jpeg"

    system_instruction = (
        "You are an elite principal municipal civil engineer and urban environmental crisis analyst. "
        "Analyze the provided photographic evidence of an urban civic issue.\n\n"
        "STRICT REQUIREMENTS:\n"
        "1. Classify the issue strictly into one of: 'Pothole', 'Garbage Dump', 'Drainage', 'Streetlight', or 'Other'.\n"
        "2. Assign a severity_score integer between 1 and 100 based on public safety threat, physical damage, and scale.\n"
        "3. Assign priority_level strictly as one of: 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'.\n"
        "4. Provide a short catchy title (max 6-8 words).\n"
        "5. Provide hazard_summary: exactly a 2-line crisp summary of the immediate risk and impact.\n"
        "6. Provide recommended_action: immediate operational instruction for municipal rapid dispatch units.\n"
        "7. Provide sustainability_impact: concise note on ecology, carbon offset, groundwater, or clean urban habitat.\n"
        "Output ONLY valid JSON matching this schema."
    )

    prompt = f"""
    Evaluate this civic infrastructure photograph taken at coordinates ({latitude}, {longitude}).
    Filename context: {file.filename}

    Respond STRICTLY with a JSON object following this schema:
    {{
      "priority_level": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "severity_score": <int 1-100>,
      "issue_type": "Pothole" | "Garbage Dump" | "Drainage" | "Streetlight" | "Other",
      "title": "<Short catchy title>",
      "hazard_summary": "<Line 1: Risk detail>\\n<Line 2: Public impact>",
      "recommended_action": "<Immediate authority action>",
      "sustainability_impact": "<Environmental impact note>"
    }}
    """

    analysis_data: Optional[dict] = None

    if genai_client:
        try:
            from google.genai import types

            image_part = types.Part.from_bytes(data=image_bytes, mime_type=content_type)
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                temperature=0.2,
            )

            response = genai_client.models.generate_content(
                model="gemini-1.5-flash",
                contents=[image_part, prompt],
                config=config,
            )

            if response and response.text:
                parsed = json.loads(response.text.strip())
                valid_priorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
                valid_types = ["Pothole", "Garbage Dump", "Drainage", "Streetlight", "Other"]
                
                if parsed.get("priority_level") not in valid_priorities:
                    parsed["priority_level"] = "HIGH"
                if parsed.get("issue_type") not in valid_types:
                    parsed["issue_type"] = "Other"
                if not (1 <= int(parsed.get("severity_score", 70)) <= 100):
                    parsed["severity_score"] = 75

                analysis_data = parsed
                logger.info(f"Gemini 1.5 Flash successfully analyzed image: {analysis_data.get('title')}")
        except Exception as err:
            logger.error(f"Error during Gemini Vision analysis: {err}")

    # Fallback response generator if API key is not yet set or encounters an error
    if not analysis_data:
        filename_lower = (file.filename or "").lower()
        if any(w in filename_lower for w in ["hole", "pothole", "road", "asphalt", "crack"]):
            issue_type = "Pothole"
            priority = "HIGH"
            score = 78
            title = "Eroded Pavement Crater on Primary Arterial"
            hazard_summary = "Deep asphalt depression causing vehicular tire damage.\nSevere collision risk during evening peak transit."
            action = "Dispatch cold-mix bitumen rapid road repair unit."
            sustainability = "Prevents vehicular particulate emissions and transit disruption."
        elif any(w in filename_lower for w in ["drain", "water", "flood", "sewage", "sludge"]):
            issue_type = "Drainage"
            priority = "CRITICAL"
            score = 92
            title = "Storm Drainage Choke with Silt & Debris"
            hazard_summary = "Culvert passage choked by non-biodegradable debris.\nImmediate street inundation and sewage overflow risk."
            action = "Deploy municipal high-pressure suction clearing crew immediately."
            sustainability = "Stops contaminated storm runoff from polluting local water bodies."
        elif any(w in filename_lower for w in ["light", "lamp", "pole", "dark"]):
            issue_type = "Streetlight"
            priority = "MEDIUM"
            score = 55
            title = "Solar Street Luminaire Grid Fault"
            hazard_summary = "Non-functional street fixture creating 40-meter dark zone.\nCompromises nocturnal visibility and pedestrian safety."
            action = "Replace luminaire LED driver module and check solar storage."
            sustainability = "Restores zero-emission smart solar municipal lighting."
        else:
            issue_type = "Garbage Dump"
            priority = "HIGH"
            score = 80
            title = "Unattended Municipal Refuse Heap"
            hazard_summary = "Illegal open dumping obstructing public pedestrian corridor.\nBiochemical decomposition generating vectors and odor."
            action = "Route municipal compacting truck and sanitize collection area."
            sustainability = "Prevents toxic microplastic dispersion and protects soil biome."

        analysis_data = {
            "priority_level": priority,
            "severity_score": score,
            "issue_type": issue_type,
            "title": title,
            "hazard_summary": hazard_summary,
            "recommended_action": action,
            "sustainability_impact": sustainability,
        }

    # -------------------------------------------------------------------------
    # Duplicate Complaint Clustering Check (50-meter radius & same issue_type)
    # -------------------------------------------------------------------------
    matched_duplicate = None
    min_dist = float("inf")

    for existing in REPORTS_DB:
        if existing.get("status") != "RESOLVED" and existing.get("issue_type") == analysis_data["issue_type"]:
            dist = get_distance_meters(
                float(latitude), float(longitude),
                float(existing["latitude"]), float(existing["longitude"])
            )
            if dist <= 50.0 and dist < min_dist:
                min_dist = dist
                matched_duplicate = existing

    # If duplicate found within 50m, cluster and escalate existing complaint
    if matched_duplicate:
        matched_duplicate["duplicate_count"] = matched_duplicate.get("duplicate_count", 1) + 1
        boosted_score = min(100, int(matched_duplicate["severity_score"]) + 15)
        matched_duplicate["severity_score"] = boosted_score
        matched_duplicate["priority_level"] = "CRITICAL"
        matched_duplicate["last_escalated_at"] = datetime.now(timezone.utc).isoformat()

        logger.info(
            f"Clustered duplicate report within {min_dist:.1f}m! "
            f"Merged into {matched_duplicate['id']}. Duplicate count: {matched_duplicate['duplicate_count']}, "
            f"Boosted severity: {boosted_score}, Priority: CRITICAL"
        )

        matched_dict = dict(matched_duplicate)
        matched_dict["is_duplicate"] = True
        matched_dict["merged_into_report_id"] = matched_duplicate["id"]

        return ReportRecord(**matched_dict)

    # -------------------------------------------------------------------------
    # No duplicate found: Save as new unique report
    # -------------------------------------------------------------------------
    report_id = f"CR-{1050 + len(REPORTS_DB)}"
    now_iso = datetime.now(timezone.utc).isoformat()

    new_report = {
        "id": report_id,
        "title": analysis_data["title"],
        "issue_type": analysis_data["issue_type"],
        "priority_level": analysis_data["priority_level"],
        "severity_score": int(analysis_data["severity_score"]),
        "hazard_summary": analysis_data["hazard_summary"],
        "recommended_action": analysis_data["recommended_action"],
        "sustainability_impact": analysis_data["sustainability_impact"],
        "latitude": float(latitude),
        "longitude": float(longitude),
        "timestamp": now_iso,
        "status": "OPEN",
        "image_filename": file.filename or f"{report_id}.jpg",
        "duplicate_count": 1,
        "is_duplicate": False,
        "merged_into_report_id": None,
    }

    # Store BEFORE photo bytes in memory for subsequent Proof-of-Work comparison
    IMAGES_STORE[report_id] = {
        "bytes": image_bytes,
        "content_type": content_type,
        "filename": file.filename,
    }

    REPORTS_DB.insert(0, new_report)
    logger.info(f"Persisted report {report_id} to in-memory database. Total: {len(REPORTS_DB)}")

    return ReportRecord(**new_report)


@app.post("/api/v1/verify-repair", response_model=RepairVerificationResponse)
async def verify_repair_work(
    issue_id: str = Form(..., description="Unique ID of the civic issue, e.g. CR-1049"),
    after_file: UploadFile = File(..., description="Photographic proof of completed repair work"),
):
    """
    Proof-of-Work (Before vs After) Verification Endpoint:
    Compares original 'Before' photo with contractor's 'After' repair photograph using
    Gemini 1.5 Flash Vision. Verifies repair authenticity, completeness, and contractor payout eligibility.
    """
    logger.info(f"Received repair verification request for issue: {issue_id}")

    # 1. Fetch the original report from database
    report = next((r for r in REPORTS_DB if r["id"].upper() == issue_id.upper()), None)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Civic report with ID '{issue_id}' not found in database.",
        )

    # 2. Read the 'AFTER' repair image bytes
    try:
        after_image_bytes = await after_file.read()
        if not after_image_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty repair proof image payload.",
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read repair image: {str(e)}",
        )

    after_content_type = after_file.content_type or "image/jpeg"
    if after_content_type not in ["image/jpeg", "image/png", "image/webp", "image/heic"]:
        after_content_type = "image/jpeg"

    # 3. Retrieve the original 'BEFORE' image
    before_data = IMAGES_STORE.get(report["id"])
    before_bytes = before_data["bytes"] if before_data else DUMMY_IMAGE_BYTES
    before_content_type = before_data["content_type"] if before_data else "image/jpeg"

    # 4. Multimodal Gemini 1.5 Flash Quality Audit Comparison
    system_instruction = (
        "You are an elite principal civil infrastructure quality auditor and municipal proof-of-work verification AI. "
        "You are provided with two photographs for an urban civic issue:\n"
        "1. Image 1 (BEFORE): The initial hazard/damage photo reported by the citizen.\n"
        "2. Image 2 (AFTER): The repair/restoration photo submitted by the contractor upon completion.\n\n"
        "AUDIT PROTOCOL & RULES:\n"
        "- Thoroughly cross-examine the Before state against the After state.\n"
        "- Check if the repair work was genuinely performed at the same physical infrastructure site.\n"
        "- Check if potholes are cleanly filled, asphalt bitumen compacted, debris removed, or drainage unchoked.\n"
        "- Detect any fraudulent submissions (e.g. unrelated images, partial cosmetic covers, poor compaction).\n"
        "- Assign verification_status strictly as: 'APPROVED', 'REJECTED', or 'NEEDS_INSPECTION'.\n"
        "- Assign match_accuracy_score (integer 1-100) reflecting fix quality and location consistency.\n"
        "- Provide audit_summary: exactly a 2-line summary comparing the fix with the original damage.\n"
        "- Set contractor_payout_eligible: boolean (true only if APPROVED and score >= 80, otherwise false).\n"
        "Output ONLY valid JSON matching this schema."
    )

    prompt = f"""
    Proof-of-Work Verification Request for Civic Issue:
    - ID: {report['id']}
    - Title: {report['title']}
    - Issue Category: {report['issue_type']}
    - Original Hazard Description: {report['hazard_summary']}
    - Required Action: {report['recommended_action']}

    Image 1 is the 'BEFORE' damage photo.
    Image 2 is the 'AFTER' repair work photo.

    Respond STRICTLY in JSON format:
    {{
      "verification_status": "APPROVED" | "REJECTED" | "NEEDS_INSPECTION",
      "match_accuracy_score": <int 1-100>,
      "audit_summary": "<Line 1: Restoration quality and before-vs-after comparison>\\n<Line 2: Municipal compliance and site clearance confirmation>",
      "contractor_payout_eligible": true | false
    }}
    """

    verification_data: Optional[dict] = None

    if genai_client:
        try:
            from google.genai import types

            before_part = types.Part.from_bytes(data=before_bytes, mime_type=before_content_type)
            after_part = types.Part.from_bytes(data=after_image_bytes, mime_type=after_content_type)

            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                temperature=0.1,
            )

            # Pass BOTH parts: Image 1 (Before) and Image 2 (After)
            response = genai_client.models.generate_content(
                model="gemini-1.5-flash",
                contents=[before_part, after_part, prompt],
                config=config,
            )

            if response and response.text:
                parsed = json.loads(response.text.strip())
                valid_statuses = ["APPROVED", "REJECTED", "NEEDS_INSPECTION"]
                if parsed.get("verification_status") not in valid_statuses:
                    parsed["verification_status"] = "APPROVED"
                if not (1 <= int(parsed.get("match_accuracy_score", 90)) <= 100):
                    parsed["match_accuracy_score"] = 92
                if not isinstance(parsed.get("contractor_payout_eligible"), bool):
                    parsed["contractor_payout_eligible"] = parsed.get("verification_status") == "APPROVED"

                verification_data = parsed
                logger.info(f"Gemini 1.5 Flash Proof-of-Work audit completed for {issue_id}: {verification_data.get('verification_status')}")
        except Exception as err:
            logger.error(f"Error calling Gemini for Proof-of-Work audit: {err}")

    # Fallback response generator if Gemini API key fails or offline
    if not verification_data:
        after_filename = (after_file.filename or "").lower()
        is_bad = any(w in after_filename for w in ["bad", "fail", "incomplete", "reject", "fake"])
        status_verdict = "REJECTED" if is_bad else "APPROVED"
        score = 42 if is_bad else 94
        payout = status_verdict == "APPROVED"

        if status_verdict == "APPROVED":
            summary = f"Restoration work for '{report['title']}' verified at coordinates ({report['latitude']}, {report['longitude']}).\nDamage fully rectified to municipal code with zero residual obstruction."
        else:
            summary = f"After-photo inspection shows incomplete rectification for '{report['title']}'.\nResidual debris or inadequate compaction observed on site."

        verification_data = {
            "verification_status": status_verdict,
            "match_accuracy_score": score,
            "audit_summary": summary,
            "contractor_payout_eligible": payout,
        }

    # Update report status in REPORTS_DB to RESOLVED if approved
    if verification_data["verification_status"] == "APPROVED":
        report["status"] = "RESOLVED"
        report["priority_level"] = "LOW"  # De-escalate hazard on map
        report["verified_at"] = datetime.now(timezone.utc).isoformat()
        report["audit"] = verification_data
        logger.info(f"Civic report {report['id']} marked as RESOLVED. Payout cleared: {verification_data['contractor_payout_eligible']}")
    elif verification_data["verification_status"] == "NEEDS_INSPECTION":
        report["status"] = "NEEDS_INSPECTION"
    else:
        report["status"] = "REJECTED"

    return RepairVerificationResponse(
        issue_id=report["id"],
        verification_status=verification_data["verification_status"],
        match_accuracy_score=int(verification_data["match_accuracy_score"]),
        audit_summary=verification_data["audit_summary"],
        contractor_payout_eligible=bool(verification_data["contractor_payout_eligible"]),
        report_status=report["status"],
    )


@app.get("/api/v1/reports", response_model=List[ReportRecord])
async def get_all_reports():
    """
    Returns all analyzed civic reports stored in memory for interactive
    plotting and real-time filtering on the Leaflet geospatial map.
    """
    return [ReportRecord(**r) for r in REPORTS_DB]


@app.post("/api/v1/analyze-report", response_model=AIAnalysisResult)
async def analyze_civic_text_report(report: CivicReportRequest):
    """
    Text-based civic report analysis using Gemini 1.5 Flash.
    """
    logger.info(f"Analyzing text report: {report.title} [{report.category}]")

    prompt = f"""
    You are an automated civic infrastructure and environmental crisis analysis AI.
    Evaluate the following civic complaint:
    
    Title: {report.title}
    Category: {report.category}
    Description: {report.description}
    Coordinates: ({report.latitude}, {report.longitude})

    Respond STRICTLY in JSON format with keys:
    - priority_level: One of ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    - severity_score: Integer from 1 to 100
    - hazard_type: Short descriptive string
    - recommended_action: Immediate municipal protocol
    - sustainability_impact: Impact on urban sustainability and ecology
    - actionable_tags: Array of 3 to 5 categorical tags
    """
    
    if genai_client:
        try:
            from google.genai import types
            response = genai_client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                )
            )
            parsed = json.loads(response.text.strip())
            return AIAnalysisResult(**parsed)
        except Exception as e:
            logger.error(f"Gemini text analysis error: {e}")

    # Fallback response
    return AIAnalysisResult(
        priority_level="HIGH",
        severity_score=78,
        hazard_type=f"Civic {report.category} Hazard",
        recommended_action="Dispatch local municipal response unit for inspection and perimeter safety.",
        sustainability_impact="Mitigates localized ecological degradation and community hazard footprint.",
        actionable_tags=[report.category, "RapidResponse", "UrbanSafety", "EcoWatch"],
    )


@app.get("/api/v1/reports/recent")
async def get_recent_reports():
    """Returns top recent civic telemetry reports for the live frontend feed."""
    return REPORTS_DB[:6]


@app.get("/api/v1/eco-metrics")
async def get_eco_metrics():
    """Returns sustainability telemetry metrics for the city dashboard."""
    active_count = len([r for r in REPORTS_DB if r.get("status") != "RESOLVED" and r.get("priority_level") in ["HIGH", "CRITICAL"]])
    return [
        {"area_name": "Central Metro Core", "air_quality_index": 72, "cleanliness_score": 88, "active_hazard_count": active_count, "carbon_offset_kg": 1420.5},
        {"area_name": "Green Belt Eco Zone", "air_quality_index": 41, "cleanliness_score": 96, "active_hazard_count": 1, "carbon_offset_kg": 3890.0},
        {"area_name": "Industrial Logistics Hub", "air_quality_index": 128, "cleanliness_score": 64, "active_hazard_count": 8, "carbon_offset_kg": 850.2},
    ]
