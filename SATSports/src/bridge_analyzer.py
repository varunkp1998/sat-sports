import sys
import json
import cv2
import mediapipe as mp
from serve_analyzer import analyze_serve, get_phase_name
from feedback_generator import generate_feedback

def run_analysis(video_path):
    cap = cv2.VideoCapture(video_path)
    pose = mp.solutions.pose.Pose()
    
    # We analyze the "Contact" frame for the final score
    final_analysis = {"score": 0, "phases": {}}
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        
        # Using your existing detect_pose logic 
        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(image_rgb)
        
        if results.pose_landmarks:
            phase = get_phase_name(results.pose_landmarks) [cite: 5]
            # Use your existing analyzer to get angles 
            feedback = analyze_serve(results.pose_landmarks, phase) [cite: 5]
            
            # Record metrics for the bridge
            final_analysis["phases"][phase] = feedback

    # Output JSON for Node.js to read
    print(json.dumps(final_analysis))

if __name__ == "__main__":
    run_analysis(sys.argv[1])