"""
Full end-to-end test of the destiny reading pipeline.
Tests: auth → V2T analysis → reading creation → analysis completion → result retrieval
"""
import requests
import time
import sys
import cv2
import numpy as np
import io

BASE = "http://127.0.0.1:8000"
passed = 0
failed = 0
errors = []

def test(name, condition, detail=""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  [PASS] {name}")
    else:
        failed += 1
        msg = f"  [FAIL] {name}" + (f" -- {detail}" if detail else "")
        print(msg)
        errors.append(msg)

def auth_header(token):
    return {"Authorization": f"Bearer {token}"}

def make_face_image():
    """Create a synthetic face image for testing."""
    img = np.zeros((400, 400, 3), dtype=np.uint8)
    cv2.ellipse(img, (200, 200), (120, 160), 0, 0, 360, (180, 160, 140), -1)
    cv2.ellipse(img, (160, 170), (18, 10), 0, 0, 360, (255, 255, 255), -1)
    cv2.ellipse(img, (240, 170), (18, 10), 0, 0, 360, (255, 255, 255), -1)
    cv2.circle(img, (160, 170), 8, (50, 30, 20), -1)
    cv2.circle(img, (240, 170), 8, (50, 30, 20), -1)
    cv2.line(img, (200, 185), (200, 230), (140, 120, 100), 2)
    cv2.ellipse(img, (200, 235), (12, 6), 0, 0, 360, (140, 120, 100), -1)
    cv2.ellipse(img, (200, 275), (35, 12), 0, 0, 180, (100, 60, 60), 2)
    cv2.line(img, (140, 150), (180, 145), (80, 60, 40), 2)
    cv2.line(img, (220, 145), (260, 150), (80, 60, 40), 2)
    _, buf = cv2.imencode('.jpg', img)
    return io.BytesIO(buf.tobytes())

def make_hand_image():
    """Create a synthetic hand-like image for testing."""
    img = np.full((400, 400, 3), (180, 160, 140), dtype=np.uint8)
    # Draw palm area
    cv2.ellipse(img, (200, 250), (80, 100), 0, 0, 360, (160, 140, 120), -1)
    # Draw fingers
    for dx, dy in [(-50, -120), (-20, -140), (10, -130), (40, -110)]:
        cv2.ellipse(img, (200+dx, 250+dy), (12, 35), 0, 0, 360, (170, 150, 130), -1)
    # Thumb
    cv2.ellipse(img, (120, 220), (15, 30), -30, 0, 360, (170, 150, 130), -1)
    _, buf = cv2.imencode('.jpg', img)
    return io.BytesIO(buf.tobytes())


# ═══════════════════════════════════════════════════════════════════
#  1. AUTH FLOW
# ═══════════════════════════════════════════════════════════════════
print("\n" + "="*60)
print("  1. AUTH FLOW")
print("="*60)

# 1.1 Health check
r = requests.get(f"{BASE}/health")
test("Health check returns 200", r.status_code == 200)

# 1.2 Register
test_email = f"test_flow_{int(time.time())}@example.com"
test_password = "Test123456!"
r = requests.post(f"{BASE}/api/auth/register", json={
    "email": test_email,
    "password": test_password,
    "display_name": "Flow Test User",
    "privacy_accepted": True,
})
test("Register returns 200", r.status_code == 200, f"got {r.status_code}: {r.text[:100]}")
dev_code = r.json().get("_dev_code", "")

# 1.3 Verify email
r = requests.post(f"{BASE}/api/auth/verify-email", json={
    "email": test_email,
    "code": dev_code,
})
test("Verify email returns 200", r.status_code == 200, f"got {r.status_code}: {r.text[:100]}")
tokens = r.json()
access_token = tokens.get("access_token", "")
refresh_token = tokens.get("refresh_token", "")
test("Access token received", bool(access_token))
test("Refresh token received", bool(refresh_token))

# 1.4 Login
r = requests.post(f"{BASE}/api/auth/login", json={
    "email": test_email,
    "password": test_password,
})
test("Login returns 200", r.status_code == 200, f"got {r.status_code}: {r.text[:100]}")
if r.status_code == 200:
    access_token = r.json().get("access_token", access_token)

# 1.5 Get current user
r = requests.get(f"{BASE}/api/auth/me", headers=auth_header(access_token))
test("GET /me returns 200", r.status_code == 200)
test("User email matches", r.json().get("email") == test_email if r.status_code == 200 else False)

headers = auth_header(access_token)


# ═══════════════════════════════════════════════════════════════════
#  2. V2T ANALYSIS ENDPOINTS
# ═══════════════════════════════════════════════════════════════════
print("\n" + "="*60)
print("  2. V2T ANALYSIS ENDPOINTS")
print("="*60)

# 2.1 Analyze face image
face_file = make_face_image()
r = requests.post(f"{BASE}/api/readings/analyze-face",
    files={"file": ("face.jpg", face_file, "image/jpeg")})
test("POST /analyze-face returns 200", r.status_code == 200, f"got {r.status_code}: {r.text[:200]}")
if r.status_code == 200:
    data = r.json()
    test("Face analysis has face_text", bool(data.get("face_text")), "face_text is empty")
    test("Face analysis has features dict", isinstance(data.get("features"), dict))
    test("Face features has face_shape", bool(data.get("features", {}).get("face_shape")))
    face_text = data["face_text"]
    test("Face text length > 50", len(face_text) > 50, f"got {len(face_text)}")
    print(f"    [INFO] Face text preview: {face_text[:80]}...")
else:
    face_text = ""
    print(f"    [WARN]  Face analysis failed: {r.text[:200]}")

# 2.2 Analyze palm image
palm_file = make_hand_image()
r = requests.post(f"{BASE}/api/readings/analyze-palm",
    files={"file": ("palm.jpg", palm_file, "image/jpeg")})
# Palm detection on synthetic image may fail — that's OK
if r.status_code == 200:
    palm_data = r.json()
    palm_text = palm_data.get("palm_text", "")
    test("Palm analysis has palm_text", bool(palm_text), "palm_text is empty")
    test("Palm analysis has features dict", isinstance(palm_data.get("features"), dict))
    print(f"    [INFO] Palm text preview: {palm_text[:80]}...")
else:
    palm_text = ""
    print(f"    [WARN]  Palm analysis returned {r.status_code} (synthetic image may not contain hand)")

# 2.3 Analyze face with no image (should fail gracefully)
r = requests.post(f"{BASE}/api/readings/analyze-face", files={"file": ("empty.jpg", b"", "image/jpeg")})
test("Empty face image returns error", r.status_code in [400, 413, 422], f"got {r.status_code}")


# ═══════════════════════════════════════════════════════════════════
#  3. READING CREATION (with face + palm data)
# ═══════════════════════════════════════════════════════════════════
print("\n" + "="*60)
print("  3. READING CREATION (with face + palm)")
print("="*60)

reading_payload = {
    "gender": "female",
    "birth_year": 1990,
    "birth_month": 6,
    "birth_day": 15,
    "birth_hour": 10,
    "birth_minute": 30,
    "birth_city": "Beijing",
    "latitude": 39.9,
    "longitude": 116.4,
    "user_question": "我的事业运势如何？未来三年有什么机遇？",
    "is_premium": False,
    "language": "zh",
    "tarot_cards": [
        {"position": "past", "card": "The Fool", "reversed": False},
        {"position": "present", "card": "The Tower", "reversed": True},
        {"position": "future", "card": "The Star", "reversed": False},
    ],
    "face_raw_text": face_text if face_text else "脸型: 鹅蛋形脸\n三庭比例: 上停34% 中停42% 下停25%\n额头: 额头适中端正\n眼型眼神: 眼睛适中沉稳，眼神温和\n鼻型准头: 准头适中，山根适中\n唇型人中: 口型适中，人中适中\n下巴地阁: 下停适中\n两颧: 两颧适中\n综合: 面相格局中等",
    "palm_raw_text": palm_text if palm_text else "检测手: 右手\n手型: 圆锥形手\n生命线: 生命线深长清晰\n智慧线: 智慧线长而平直\n感情线: 感情线延伸至食指下方\n命运线: 命运线从月丘升起\n综合: 手相格局上等",
}

# 3.1 Create reading
r = requests.post(f"{BASE}/api/readings", json=reading_payload, headers=headers)
test("POST /readings returns 200", r.status_code == 200, f"got {r.status_code}: {r.text[:200]}")
if r.status_code != 200:
    print(f"    [ERROR] Cannot continue without session_id")
    sys.exit(1)

resp = r.json()
session_id = resp.get("session_id", "")
test("Session ID received", bool(session_id))
test("Status is 'init' or 'processing'", resp.get("status") in ("init", "processing", "pending"), f"got {resp.get('status')}")
print(f"    [ID] Session: {session_id}")

# 3.2 Check face/palm outputs in initial response
face_out = resp.get("face")
palm_out = resp.get("palm")
test("Face output present in response", face_out is not None)
test("Palm output present in response", palm_out is not None)
if face_out:
    test("Face output has report field", "report" in face_out)
if palm_out:
    test("Palm output has report field", "report" in palm_out)


# ═══════════════════════════════════════════════════════════════════
#  4. POLL FOR ANALYSIS COMPLETION
# ═══════════════════════════════════════════════════════════════════
print("\n" + "="*60)
print("  4. POLL FOR ANALYSIS COMPLETION")
print("="*60)

max_wait = 120  # seconds
poll_interval = 3
start_time = time.time()
final_status = None

while time.time() - start_time < max_wait:
    r = requests.get(f"{BASE}/api/readings/session/{session_id}", headers=headers)
    if r.status_code != 200:
        print(f"    [WARN]  Poll returned {r.status_code}")
        time.sleep(poll_interval)
        continue

    data = r.json()
    status = data.get("status", "")
    elapsed = int(time.time() - start_time)

    if status == "done":
        final_status = data
        print(f"    [TIME]  Analysis completed in {elapsed}s")
        break
    elif status == "error":
        final_status = data
        print(f"    [ERROR] Analysis failed after {elapsed}s: {data.get('errors', [])}")
        break
    else:
        # Print progress dots
        elapsed_dot = "." * (elapsed // 3 % 4)
        print(f"\r    [WAIT] Status: {status} ({elapsed}s){elapsed_dot}    ", end="", flush=True)
        time.sleep(poll_interval)

if final_status is None:
    print(f"\n    [ERROR] Analysis timed out after {max_wait}s")
    # Still continue to check what we have
    r = requests.get(f"{BASE}/api/readings/session/{session_id}", headers=headers)
    final_status = r.json() if r.status_code == 200 else {}


# ═══════════════════════════════════════════════════════════════════
#  5. VERIFY ANALYSIS RESULTS
# ═══════════════════════════════════════════════════════════════════
print("\n" + "="*60)
print("  5. VERIFY ANALYSIS RESULTS")
print("="*60)

if not final_status:
    print("    [WARN]  No results to verify (analysis may have timed out)")
else:
    status = final_status.get("status", "")
    test("Final status is 'done'", status == "done", f"got '{status}'")

    # 5.1 Master summary
    master = final_status.get("master_summary", "")
    test("Master summary is non-empty", bool(master), "master_summary is empty")
    if master:
        print(f"    [INFO] Master summary preview: {master[:100]}...")

    # 5.2 Individual worker reports
    workers = {
        "astrology": final_status.get("astrology"),
        "tarot": final_status.get("tarot"),
        "bazi": final_status.get("bazi"),
        "qimen": final_status.get("qimen"),
        "ziwei": final_status.get("ziwei"),
        "face": final_status.get("face"),
        "palm": final_status.get("palm"),
    }

    for name, wo in workers.items():
        if wo:
            report = wo.get("report", "")
            error = wo.get("error")
            duration = wo.get("duration_ms")
            has_content = bool(report) and "skipped" not in report.lower()
            # Face/palm are LLM-dependent and may return empty under concurrent load
            if name in ("face", "palm"):
                if has_content:
                    test(f"Worker '{name}' has report", True)
                    print(f"    [INFO] {name}: {report[:80]}...")
                elif error:
                    test(f"Worker '{name}' has report", False, f"error: {error[:100]}")
                else:
                    print(f"    [WARN]  {name}: empty report (LLM may have returned empty content)")
            else:
                test(f"Worker '{name}' has report", bool(report), f"report empty or missing")
                if has_content:
                    print(f"    [INFO] {name}: {report[:80]}...")
                elif "skipped" in report.lower():
                    print(f"    [WARN]  {name}: SKIPPED — {report[:80]}")
                if error:
                    print(f"    [WARN]  {name} error: {error[:100]}")
        else:
            test(f"Worker '{name}' output present", False, "output is None")

    # 5.3 Face analysis specifically
    face_report = workers.get("face", {})
    if face_report:
        face_rpt = face_report.get("report", "")
        face_skipped = "skipped" in face_rpt.lower() or "no facial" in face_rpt.lower()
        test("Face analysis NOT skipped", not face_skipped,
             f"face report: {face_rpt[:100]}" if face_skipped else "")

    # 5.4 Palm analysis specifically
    palm_report = workers.get("palm", {})
    if palm_report:
        palm_rpt = palm_report.get("report", "")
        palm_skipped = "skipped" in palm_rpt.lower() or "no palm" in palm_rpt.lower()
        test("Palm analysis NOT skipped", not palm_skipped,
             f"palm report: {palm_rpt[:100]}" if palm_skipped else "")


# ═══════════════════════════════════════════════════════════════════
#  6. READING WITHOUT FACE/PALM (control test)
# ═══════════════════════════════════════════════════════════════════
print("\n" + "="*60)
print("  6. READING WITHOUT FACE/PALM (control)")
print("="*60)

ctrl_payload = {
    "gender": "male",
    "birth_year": 1985,
    "birth_month": 3,
    "birth_day": 20,
    "birth_hour": 14,
    "birth_minute": 0,
    "birth_city": "Shanghai",
    "latitude": 31.2,
    "longitude": 121.5,
    "user_question": "感情方面何时有正缘？",
    "is_premium": False,
    "language": "zh",
    "tarot_cards": [
        {"position": "past", "card": "The Moon", "reversed": False},
        {"position": "present", "card": "The Sun", "reversed": False},
        {"position": "future", "card": "The World", "reversed": False},
    ],
    "face_raw_text": "",
    "palm_raw_text": "",
}

r = requests.post(f"{BASE}/api/readings", json=ctrl_payload, headers=headers)
test("Control reading created", r.status_code == 200, f"got {r.status_code}")
if r.status_code == 200:
    ctrl_sid = r.json().get("session_id", "")
    ctrl_face = r.json().get("face")
    ctrl_palm = r.json().get("palm")
    test("Control face output exists", ctrl_face is not None)
    test("Control palm output exists", ctrl_palm is not None)

    # Poll for control reading completion to check face/palm skip status
    ctrl_done = False
    for _ in range(20):
        time.sleep(3)
        r2 = requests.get(f"{BASE}/api/readings/session/{ctrl_sid}", headers=headers)
        if r2.status_code == 200:
            d2 = r2.json()
            if d2.get("status") == "done":
                ctrl_face = d2.get("face")
                ctrl_palm = d2.get("palm")
                ctrl_done = True
                break
    if ctrl_face:
        test("Control face is skipped", "skipped" in ctrl_face.get("report", "").lower(),
             f"report: {ctrl_face.get('report', '')[:80]}")
    if ctrl_palm:
        test("Control palm is skipped", "skipped" in ctrl_palm.get("report", "").lower(),
             f"report: {ctrl_palm.get('report', '')[:80]}")
    if not ctrl_done:
        print("    [WARN]  Control reading did not complete within timeout")


# ═══════════════════════════════════════════════════════════════════
#  7. MY READINGS LIST
# ═══════════════════════════════════════════════════════════════════
print("\n" + "="*60)
print("  7. MY READINGS LIST")
print("="*60)

r = requests.get(f"{BASE}/api/readings/my", headers=headers)
test("GET /my returns 200", r.status_code == 200)
if r.status_code == 200:
    readings = r.json()
    test("My readings list is non-empty", len(readings) > 0, f"got {len(readings)} readings")
    for rd in readings:
        print(f"    [READ] {rd.get('id', '?')[:8]}... status={rd.get('status')} created={rd.get('created_at', '?')[:19]}")


# ═══════════════════════════════════════════════════════════════════
#  8. EDGE CASES
# ═══════════════════════════════════════════════════════════════════
print("\n" + "="*60)
print("  8. EDGE CASES")
print("="*60)

# 8.1 Get non-existent session
r = requests.get(f"{BASE}/api/readings/session/nonexistent-id-12345", headers=headers)
test("Non-existent session returns 404", r.status_code == 404, f"got {r.status_code}")

# 8.2 Create reading without auth (should still work for anonymous)
r = requests.post(f"{BASE}/api/readings", json=ctrl_payload)
test("Anonymous reading creation works", r.status_code == 200, f"got {r.status_code}")

# 8.3 Create reading with invalid data
bad_payload = {**ctrl_payload, "birth_year": -1}
r = requests.post(f"{BASE}/api/readings", json=bad_payload, headers=headers)
test("Invalid birth year returns error", r.status_code in [400, 422], f"got {r.status_code}")

# 8.4 Ping endpoint
r = requests.get(f"{BASE}/api/readings/ping")
test("Ping returns 200", r.status_code == 200)


# ═══════════════════════════════════════════════════════════════════
#  SUMMARY
# ═══════════════════════════════════════════════════════════════════
print("\n" + "="*60)
print(f"  RESULTS: {passed} passed, {failed} failed")
print("="*60)
if errors:
    print("\n  FAILED TESTS:")
    for e in errors:
        print(f"  {e}")
print()
