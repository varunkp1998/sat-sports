from PyQt5.QtWidgets import QWidget, QLabel, QVBoxLayout
from PyQt5.QtGui import QPainter, QPen, QColor, QBrush
from PyQt5.QtCore import Qt

class PoseViewer(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("🦴 Skeletal Pose Viewer")
        self.setGeometry(1100, 100, 480, 600)
        self.landmarks = None
        self.frame_size = (1, 1)

        self.label = QLabel("🕴 Pose visualization will appear here")
        layout = QVBoxLayout()
        layout.addWidget(self.label)
        self.setLayout(layout)

    def update_pose(self, landmarks, shape):
        self.landmarks = landmarks
        self.frame_size = (shape[1], shape[0])  # width, height
        self.update()

    def paintEvent(self, event):
        if not self.landmarks:
            return

        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)

        w, h = self.frame_size
        pts = [(int(l.x * w), int(l.y * h)) for l in self.landmarks.landmark]

        # 🔵 Dark blue bone lines
        pen = QPen(QColor(0, 0, 128), 3)
        painter.setPen(pen)

        pairs = [
            (11, 13), (13, 15), (12, 14), (14, 16),
            (11, 12), (23, 24), (11, 23), (12, 24),
            (23, 25), (25, 27), (24, 26), (26, 28)
        ]
        for a, b in pairs:
            if a < len(pts) and b < len(pts):
                painter.drawLine(pts[a][0], pts[a][1], pts[b][0], pts[b][1])

        # 🟢 Green joint circles
        brush = QBrush(QColor(0, 255, 0, 200))
        painter.setBrush(brush)
        for x, y in pts:
            painter.drawEllipse(x - 4, y - 4, 8, 8)
