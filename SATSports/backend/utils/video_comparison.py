import cv2
import numpy as np

def compare_videos(video_paths, output_path):
    """
    Compares multiple videos side by side.
    
    Args:
    - video_paths (list): List of paths to video files.
    - output_path (str): Path to save the combined video.
    """
    caps = [cv2.VideoCapture(video_path) for video_path in video_paths]
    
    # Get the frame width, height, and fps from the first video
    width = int(caps[0].get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(caps[0].get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = caps[0].get(cv2.CAP_PROP_FPS)
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Encoding for .mp4
    out = cv2.VideoWriter(output_path, fourcc, fps, (width * len(video_paths), height))
    
    # Read frames from all videos and combine them horizontally
    while True:
        frames = []
        for cap in caps:
            ret, frame = cap.read()
            if not ret:
                break
            frames.append(frame)
        
        if len(frames) < len(caps):
            break
        
        # Combine frames horizontally
        combined_frame = np.hstack(frames)
        out.write(combined_frame)
    
    # Release the video capture and writer
    for cap in caps:
        cap.release()
    out.release()
    print(f"Comparison video saved to {output_path}")
