import cv2
import mediapipe as mp
import numpy as np

mp_pose = mp.solutions.pose
CUSTOM_CONNECTIONS = list(mp_pose.POSE_CONNECTIONS)

# Constants
CM_PER_PIXEL = 0.18  # Adjust this based on your video and distance

def detect_pose(frame, pose):
    image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(image_rgb)
    return frame, results.pose_landmarks if results.pose_landmarks else None

def draw_skeleton(frame, landmarks):
    if not landmarks:
        return frame

    height, width, _ = frame.shape
    landmark_points = []

    # 🎨 Choose ONE generic color (e.g., white)
    COLOR = (255, 255, 255)   # White
    LINE_THICKNESS = 3
    JOINT_RADIUS = 5

    # Convert landmarks to pixel coordinates
    for lm in landmarks.landmark:
        x, y = int(lm.x * width), int(lm.y * height)
        landmark_points.append((x, y))

    # Draw bones (lines)
    for connection in CUSTOM_CONNECTIONS:
        start_idx, end_idx = connection
        if 0 <= start_idx < len(landmark_points) and 0 <= end_idx < len(landmark_points):
            pt1 = landmark_points[start_idx]
            pt2 = landmark_points[end_idx]
            cv2.line(frame, pt1, pt2, COLOR, LINE_THICKNESS)

    # Draw joints (circles only at landmarks)
    for pt in landmark_points:
        cv2.circle(frame, pt, JOINT_RADIUS, COLOR, -1)

    return frame


def calculate_hip_drive(landmarks, width, initial_hip_x):
    left_hip = landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP]
    right_hip = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_HIP]
    hip_x = (left_hip.x + right_hip.x) / 2 * width

    if initial_hip_x is None:
        return 0, hip_x  # Initialize

    displacement_px = hip_x - initial_hip_x
    displacement_cm = displacement_px * CM_PER_PIXEL
    return displacement_cm, initial_hip_x

def calculate_torso_rotation(landmarks):
    left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
    right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]

    dx = right_shoulder.x - left_shoulder.x
    dy = right_shoulder.y - left_shoulder.y
    angle_rad = np.arctan2(dy, dx)
    angle_deg = np.degrees(angle_rad)
    return abs(angle_deg)

def draw_contact_extension(frame, landmarks):
    if not landmarks:
        return frame

    height, width, _ = frame.shape
    COLOR = (255, 255, 255)  # One generic color

    rw = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
    lh = landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP]
    rh = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_HIP]

    wrist_pt = (int(rw.x * width), int(rw.y * height))
    hip_center_x = (lh.x + rh.x) / 2
    hip_center_y = (lh.y + rh.y) / 2
    hip_pt = (int(hip_center_x * width), int(hip_center_y * height))

    extension = (hip_center_y - rw.y) * height
    extension_cm = extension * CM_PER_PIXEL

    cv2.line(frame, wrist_pt, hip_pt, COLOR, 2)
    cv2.putText(frame, f"{extension_cm:.1f} cm", (wrist_pt[0] + 10, wrist_pt[1]),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, COLOR, 2)

    return frame

def calculate_weight_transfer(landmarks, frame_width):
    """
    Returns (back_percent, front_percent)
    based on hip center relative to ankle positions.
    """

    left_ankle = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ANKLE]
    right_ankle = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ANKLE]
    left_hip = landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP]
    right_hip = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_HIP]

    # Convert to pixel X coordinates
    ankle_left_x = left_ankle.x * frame_width
    ankle_right_x = right_ankle.x * frame_width

    hip_center_x = ((left_hip.x + right_hip.x) / 2) * frame_width

    back_foot_x = min(ankle_left_x, ankle_right_x)
    front_foot_x = max(ankle_left_x, ankle_right_x)

    foot_distance = front_foot_x - back_foot_x
    if foot_distance == 0:
        return 50, 50

    hip_ratio = (hip_center_x - back_foot_x) / foot_distance
    hip_ratio = max(0, min(1, hip_ratio))  # clamp 0–1

    front_percent = hip_ratio * 100
    back_percent = 100 - front_percent

    return back_percent, front_percent
