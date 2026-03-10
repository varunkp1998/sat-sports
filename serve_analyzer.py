import math

def calculate_angle(a, b, c):
    def to_np(p): return [p.x, p.y]
    a, b, c = map(to_np, [a, b, c])
    ang = math.degrees(
        math.atan2(c[1] - b[1], c[0] - b[0]) -
        math.atan2(a[1] - b[1], a[0] - b[0])
    )
    return abs(ang) if ang >= 0 else 360 + ang


def get_phase_name(landmarks):
    # Simplified phase detection by arm angle and height
    shoulder = landmarks.landmark[12]  # Right shoulder
    elbow = landmarks.landmark[14]
    wrist = landmarks.landmark[16]

    arm_angle = calculate_angle(shoulder, elbow, wrist)

    if arm_angle < 100:
        return "Backswing"
    elif arm_angle > 150:
        return "Contact"
    elif shoulder.y < elbow.y:
        return "Follow-through"
    else:
        return "Preparation"


def analyze_serve(landmarks, phase):
    feedback = f"Current Phase: {phase}\n"

    right_hip = landmarks.landmark[24]
    right_knee = landmarks.landmark[26]
    right_ankle = landmarks.landmark[28]
    hip_angle = calculate_angle(right_shoulder := landmarks.landmark[12], right_hip, right_knee)
    knee_angle = calculate_angle(right_hip, right_knee, right_ankle)
    elbow_angle = calculate_angle(landmarks.landmark[12], landmarks.landmark[14], landmarks.landmark[16])

    feedback += f"Elbow Angle: {int(elbow_angle)}°\n"
    feedback += f"Hip Angle: {int(hip_angle)}°\n"
    feedback += f"Knee Angle: {int(knee_angle)}°\n"

    if phase == "Backswing":
        if elbow_angle > 110:
            feedback += "🔄 Keep your elbow bent during backswing.\n"
    elif phase == "Contact":
        if hip_angle < 140:
            feedback += "⬆ Try extending your hip more at contact.\n"
    elif phase == "Follow-through":
        if knee_angle < 130:
            feedback += "🦵 Straighten your leg more after contact.\n"
    elif phase == "Preparation":
        feedback += "📏 Ensure proper stance and balance.\n"

    return feedback
