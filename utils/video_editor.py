import cv2
import os

def trim_video(input_path, output_path, start_time, end_time):
    """
    Trims the video between start_time and end_time (in seconds)
    
    Args:
    - input_path (str): Path to the original video file.
    - output_path (str): Path to save the trimmed video.
    - start_time (float): Start time in seconds.
    - end_time (float): End time in seconds.
    """
    # Open the original video
    cap = cv2.VideoCapture(input_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Calculate frame range
    start_frame = int(fps * start_time)
    end_frame = int(fps * end_time)
    
    # Open the output video writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Encoding for .mp4
    out = cv2.VideoWriter(output_path, fourcc, fps, (int(cap.get(3)), int(cap.get(4))))
    
    # Go to start_frame
    cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
    
    # Read frames and write to the new video
    frame_number = start_frame
    while frame_number < end_frame and cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        out.write(frame)
        frame_number += 1
    
    # Release the video objects
    cap.release()
    out.release()
    print(f"Trimmed video saved to {output_path}")
