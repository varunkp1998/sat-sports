import math
import cv2
import numpy as np
from PyQt5.QtWidgets import (
    QApplication, QWidget, QLabel, QPushButton, QVBoxLayout, QHBoxLayout,
    QFileDialog, QMainWindow, QDialog, QTextEdit, QMessageBox, QSizePolicy
)
from PyQt5.QtGui import QPixmap, QImage, QPainter, QColor
from PyQt5.QtCore import QTimer, Qt
import mediapipe as mp

# External modules
from serve_analyzer import analyze_serve, get_phase_name
from export_utils import export_feedback_pdf
from pose_utils import detect_pose, draw_skeleton, calculate_hip_drive, calculate_torso_rotation, draw_contact_extension
from utils.video_editor import trim_video
from utils.overlay_utils import draw_text, draw_arrow, draw_rectangle, draw_3d_path
from utils.video_comparison import compare_videos
from utils.tagging import generate_report
from pose_utils import calculate_weight_transfer
from utils.overlay_utils import draw_weight_transfer_meter


class FeedbackDialog(QDialog):
    def __init__(self, feedback, parent=None):
        super().__init__(parent)
        self.setWindowTitle("📊 Serve Feedback")
        self.setFixedSize(500, 400)
        layout = QVBoxLayout()
        self.text = QTextEdit()
        self.text.setText(feedback)
        self.text.setReadOnly(True)
        layout.addWidget(self.text)
        self.setLayout(layout)


class PhaseProgressBar(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.phases = ["Preparation", "Backswing", "Contact", "Follow-Through"]
        self.current_phase = ""
        self.setFixedHeight(40)

    def update_phase(self, phase):
        self.current_phase = phase
        self.update()

    def paintEvent(self, event):
        painter = QPainter(self)
        width = self.width() // len(self.phases)
        for i, phase in enumerate(self.phases):
            x = i * width
            color = QColor("#0078D7") if phase == self.current_phase else QColor("#444")
            painter.fillRect(x, 0, width, self.height(), color)
            painter.setPen(Qt.white)
            painter.drawText(x + 10, self.height() // 2 + 5, phase)


class TennisAnalyzerApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("🎾 Tennis Serve Analyzer Pro")
        self.setStyleSheet("background-color: #121212; color: white; font-family: Arial;")
        self.resize(1100, 750)
        self.setMinimumSize(800, 600)

        self.pose = mp.solutions.pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

        self.cap = None
        self.timer = QTimer()
        self.timer.timeout.connect(self.update_frame)
        self.is_playing = False
        self.slow_motion = False
        self.is_mask = False
        self.feedback = ""
        self.phase = ""
        self.frame = None
        self.initial_hip_x = None

        self.setup_ui()

    def setup_ui(self):
        self.image_label = QLabel("🎥 Load a video to begin")
        self.image_label.setAlignment(Qt.AlignCenter)
        self.image_label.setStyleSheet("border: 2px solid #444; background-color: #222;")
        self.image_label.setMinimumSize(640, 360)
        self.image_label.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)

        self.phase_bar = PhaseProgressBar()

        self.metrics_label = QLabel("📊 Metrics")
        self.metrics_label.setStyleSheet("font-weight: bold; font-size: 16px;")

        self.arm_angle_label = QLabel("Arm Angle: --°")
        self.knee_angle_label = QLabel("Knee Angle: --°")
        self.hip_displacement_label = QLabel("Hip Displacement: -- cm")
        self.phase_duration_label = QLabel("Phase Duration: -- sec")
        self.jump_detected_label = QLabel("Jump: --")
        self.torso_rotation_label = QLabel("Torso Rotation: --°")

        self.metrics_layout = QVBoxLayout()
        for lbl in [self.metrics_label, self.arm_angle_label, self.knee_angle_label,
                    self.hip_displacement_label, self.phase_duration_label,
                    self.jump_detected_label, self.torso_rotation_label]:
            self.metrics_layout.addWidget(lbl)

        self.load_btn = QPushButton("🎞 Load")
        self.play_btn = QPushButton("▶ Play")
        self.pause_btn = QPushButton("⏸ Pause")
        self.stop_btn = QPushButton("🛑 Stop")
        self.replay_btn = QPushButton("🔁 Replay")
        self.prev_frame_btn = QPushButton("⏪ Prev")
        self.frame_btn = QPushButton("⏩ Frame")
        self.slow_btn = QPushButton("🐢 Slow")
        self.mask_btn = QPushButton("🎭 Mask")
        self.feedback_btn = QPushButton("💬 Feedback")
        self.export_btn = QPushButton("📤 Export PDF")
        self.fullscreen_btn = QPushButton("🔲 Fullscreen")
        self.snapshot_btn = QPushButton("📸 Snapshot")
        self.trim_btn = QPushButton("Trim Video")
        self.annotate_btn = QPushButton("Add Annotation")
        self.compare_btn = QPushButton("Compare Videos")
        self.report_btn = QPushButton("Generate Report")

        self.snapshot_btn.setEnabled(False)

        self.load_btn.clicked.connect(self.load_video)
        self.play_btn.clicked.connect(self.toggle_play)
        self.pause_btn.clicked.connect(self.pause_video)
        self.stop_btn.clicked.connect(self.stop_video)
        self.replay_btn.clicked.connect(self.replay_video)
        self.frame_btn.clicked.connect(self.next_frame)
        self.slow_btn.clicked.connect(self.toggle_slow_motion)
        self.mask_btn.clicked.connect(self.toggle_mask)
        self.feedback_btn.clicked.connect(self.show_feedback)
        self.export_btn.clicked.connect(self.export_feedback)
        self.fullscreen_btn.clicked.connect(self.toggle_fullscreen)
        self.snapshot_btn.clicked.connect(self.take_snapshot)
        self.trim_btn.clicked.connect(self.trim_video)
        self.annotate_btn.clicked.connect(self.add_annotation)
        self.compare_btn.clicked.connect(self.compare_videos)
        self.report_btn.clicked.connect(self.generate_report)
        self.prev_frame_btn.clicked.connect(self.prev_frame)

        control_layout = QHBoxLayout()
        for btn in [self.load_btn, self.play_btn, self.pause_btn, self.stop_btn, self.replay_btn,
            self.prev_frame_btn, self.frame_btn, self.slow_btn, self.mask_btn, self.feedback_btn,
            self.export_btn, self.snapshot_btn, self.fullscreen_btn,
            self.trim_btn, self.annotate_btn, self.compare_btn, self.report_btn]:

            control_layout.addWidget(btn)

        video_layout = QVBoxLayout()
        video_layout.addWidget(self.image_label)
        video_layout.addWidget(self.phase_bar)

        main_content_layout = QHBoxLayout()
        main_content_layout.addLayout(video_layout)
        main_content_layout.addLayout(self.metrics_layout)

        main_layout = QVBoxLayout()
        main_layout.addLayout(main_content_layout)
        main_layout.addLayout(control_layout)

        container = QWidget()
        container.setLayout(main_layout)
        self.setCentralWidget(container)

    def load_video(self):
        path, _ = QFileDialog.getOpenFileName(self, "Open Video", "", "Video Files (*.mp4 *.avi)")
        if not path:
            return

        self.cap = cv2.VideoCapture(path)
        if not self.cap.isOpened():
            QMessageBox.critical(self, "Error", "Could not open video file.")
            return

        self.snapshot_btn.setEnabled(True)
        self.initial_hip_x = None

        ret, frame = self.cap.read()
        if ret:
            self.process_frame(frame)

    def toggle_play(self):
        self.pause_video() if self.is_playing else self.play_video()

    def play_video(self):
        if not self.cap:
            return
        self.is_playing = True
        self.timer.start(80 if self.slow_motion else 30)
        self.play_btn.setText("⏸ Pause")

    def pause_video(self):
        self.is_playing = False
        self.timer.stop()
        self.play_btn.setText("▶ Play")

    def stop_video(self):
        if self.cap:
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            self.timer.stop()
            self.is_playing = False
            self.play_btn.setText("▶ Play")
            ret, frame = self.cap.read()
            if ret:
                self.process_frame(frame)

    def replay_video(self):
        if self.cap:
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            self.play_video()

    def toggle_slow_motion(self):
        self.slow_motion = not self.slow_motion
    def prev_frame(self):
        if not self.cap:
            return

        # Get current frame index
        current_frame = int(self.cap.get(cv2.CAP_PROP_POS_FRAMES))

        # Move back 2 frames:
        # one to cancel the last read, one more to go backward
        target_frame = max(current_frame - 2, 0)

        self.cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame)

        ret, frame = self.cap.read()
        if ret:
            self.process_frame(frame)

    def toggle_mask(self):
        self.is_mask = not self.is_mask

        # 🔄 Re-render the current frame even when video is paused
        if self.frame is not None:
            self.process_frame(self.frame.copy())


    def toggle_fullscreen(self):
        self.showNormal() if self.isFullScreen() else self.showFullScreen()

    def update_frame(self):
        if not self.cap or not self.is_playing:
            return
        ret, frame = self.cap.read()
        if not ret:
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            return
        self.process_frame(frame)

    def next_frame(self):
        if self.cap:
            ret, frame = self.cap.read()
            if ret:
                self.process_frame(frame)

    def process_frame(self, frame):
        result_frame, landmarks = detect_pose(frame, self.pose)
        if landmarks is None or not hasattr(landmarks, "landmark"):
            return

        self.phase = get_phase_name(landmarks)
        self.phase_bar.update_phase(self.phase)
        self.feedback = analyze_serve(landmarks, self.phase)
        self.frame = result_frame.copy()

        joint_positions = [(lm.x * frame.shape[1], lm.y * frame.shape[0], lm.z)
                           for lm in landmarks.landmark]

        ##result_frame = draw_3d_path(result_frame, joint_positions)

        if self.is_mask:
            result_frame[:] = 0

        torso_angle = calculate_torso_rotation(landmarks)
        hip_disp_cm, updated_initial = calculate_hip_drive(landmarks, frame.shape[1], self.initial_hip_x)

        if self.initial_hip_x is None:
            self.initial_hip_x = updated_initial

        self.hip_displacement_label.setText(f"Hip Displacement: {hip_disp_cm:.1f} cm")
        self.torso_rotation_label.setText(f"Torso Rotation: {torso_angle:.1f}°")
        back_pct, front_pct = calculate_weight_transfer(landmarks, frame.shape[1])
        result_frame = draw_weight_transfer_meter(result_frame, back_pct, front_pct)

        result_frame = draw_skeleton(result_frame, landmarks)
        ##result_frame = draw_contact_extension(result_frame, landmarks)

        rgb = cv2.cvtColor(result_frame, cv2.COLOR_BGR2RGB)
        h, w, ch = rgb.shape
        qt_img = QImage(rgb.data, w, h, ch * w, QImage.Format_RGB888)
        self.image_label.setPixmap(QPixmap.fromImage(qt_img).scaled(
            self.image_label.width(), self.image_label.height(),
            Qt.KeepAspectRatio, Qt.SmoothTransformation))

    def show_feedback(self):
        if self.feedback:
            dlg = FeedbackDialog(self.feedback)
            dlg.exec_()

    def export_feedback(self):
        if self.feedback:
            export_feedback_pdf(self.feedback)
            QMessageBox.information(self, "Exported", "Feedback saved to PDF!")

    def take_snapshot(self):
        if self.frame is not None:
            path, _ = QFileDialog.getSaveFileName(self, "Save Snapshot", "", "PNG Image (*.png);;JPEG Image (*.jpg)")
            if path:
                cv2.imwrite(path, self.frame)
                QMessageBox.information(self, "Saved", f"Snapshot saved to:\n{path}")

    def trim_video(self):
        trim_video("input.mp4", "output.mp4", start_time=30, end_time=90)

    def add_annotation(self):
        if self.frame is None:
            return
        frame = self.frame.copy()
        frame = draw_text(frame, "Serve Phase", (50, 50))
        frame = draw_arrow(frame, (100, 100), (300, 300))
        frame = draw_rectangle(frame, (150, 150), (400, 400))
        self.process_frame(frame)

    def compare_videos(self):
        compare_videos(["video1.mp4", "video2.mp4"], "comparison.mp4")

    def generate_report(self):
        tags = {
            "Serve Phase": "Wind-Up",
            "Arm Angle": "45°",
            "Hip Displacement": "30 cm",
            "Torso Rotation": "12°",
            "Contact Point": "11:00",
        }
        generate_report(tags, "tennis_serve_report.pdf")


if __name__ == "__main__":
    import sys
    app = QApplication(sys.argv)
    win = TennisAnalyzerApp()
    win.show()
    sys.exit(app.exec_())
