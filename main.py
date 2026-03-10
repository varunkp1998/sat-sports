import sys
import os
import absl.logging

# Suppress TensorFlow and absl logging noise
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
absl.logging.set_verbosity(absl.logging.ERROR)

from PyQt5.QtWidgets import QApplication
from ui_main import TennisAnalyzerApp

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = TennisAnalyzerApp()
    window.show()
    sys.exit(app.exec_())
