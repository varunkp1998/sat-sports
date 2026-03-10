import cv2
import numpy as np

def draw_text(frame, text, position=(50, 50), font_scale=1, color=(0, 255, 0), thickness=2):
    """
    Draws text on the frame at a specific position.
    
    Args:
    - frame: The video frame (image).
    - text: The text to be displayed.
    - position: Position of the text (x, y).
    - font_scale: Scale of the font.
    - color: Color of the text (BGR format).
    - thickness: Thickness of the text.
    """
    font = cv2.FONT_HERSHEY_SIMPLEX
    cv2.putText(frame, text, position, font, font_scale, color, thickness)
    return frame

def draw_arrow(frame, start_point, end_point, color=(0, 255, 0), thickness=2):
    """
    Draws an arrow between two points on the frame.
    
    Args:
    - frame: The video frame (image).
    - start_point: Starting point of the arrow (x, y).
    - end_point: End point of the arrow (x, y).
    - color: Color of the arrow (BGR format).
    - thickness: Thickness of the arrow.
    """
    cv2.arrowedLine(frame, start_point, end_point, color, thickness)
    return frame

def draw_rectangle(frame, top_left, bottom_right, color=(0, 255, 0), thickness=2):
    """
    Draws a rectangle on the frame.
    
    Args:
    - frame: The video frame (image).
    - top_left: Top-left corner of the rectangle (x, y).
    - bottom_right: Bottom-right corner of the rectangle (x, y).
    - color: Color of the rectangle (BGR format).
    - thickness: Thickness of the rectangle.
    """
    cv2.rectangle(frame, top_left, bottom_right, color, thickness)
    return frame

def draw_3d_path(frame, joint_positions):
    """
    Draws a simple 3D path of the joints (projected onto 2D frame).
    
    Args:
    - frame: The video frame (image).
    - joint_positions: List of tuples (x, y, z) representing joint positions.
    
    Returns:
    - frame: The video frame with 3D paths drawn.
    """
    for i in range(len(joint_positions) - 1):
        start = joint_positions[i]
        end = joint_positions[i + 1]
        
        # Project 3D coordinates to 2D (simplified projection)
        start_2d = (int(start[0]), int(start[1]))
        end_2d = (int(end[0]), int(end[1]))
        
        # Draw the line (path)
        cv2.line(frame, start_2d, end_2d, (0, 255, 0), 2)
    
    return frame
def draw_weight_transfer_meter(frame, back_percent, front_percent):
    h, w, _ = frame.shape

    bar_width = 300
    bar_height = 20
    x = (w - bar_width) // 2
    y = h - 60

    back_width = int(bar_width * (back_percent / 100))
    front_width = bar_width - back_width

    # Colors
    BACK_COLOR = (255, 0, 255)    # Pink
    FRONT_COLOR = (255, 255, 0)   # Cyan
    BORDER = (255, 255, 255)

    # Draw back weight
    cv2.rectangle(frame, (x, y), (x + back_width, y + bar_height), BACK_COLOR, -1)

    # Draw front weight
    cv2.rectangle(frame, (x + back_width, y), (x + bar_width, y + bar_height), FRONT_COLOR, -1)

    # Border
    cv2.rectangle(frame, (x, y), (x + bar_width, y + bar_height), BORDER, 2)

    # Text
    cv2.putText(frame, f"{int(back_percent)}%", (x - 50, y + 15),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, BACK_COLOR, 2)
    cv2.putText(frame, f"{int(front_percent)}%", (x + bar_width + 10, y + 15),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, FRONT_COLOR, 2)
    cv2.putText(frame, "WEIGHT TRANSFER", (x + 60, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, BORDER, 2)

    return frame
