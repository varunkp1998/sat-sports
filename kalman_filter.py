# kalman_filter.py

class KalmanFilter1D:
    def __init__(self, process_variance=1e-5, measurement_variance=1e-1):
        self.process_variance = process_variance
        self.measurement_variance = measurement_variance
        self.posteri_estimate = 0.0
        self.posteri_error_estimate = 1.0

    def update(self, measurement):
        priori_estimate = self.posteri_estimate
        priori_error_estimate = self.posteri_error_estimate + self.process_variance
        gain = priori_error_estimate / (priori_error_estimate + self.measurement_variance)
        self.posteri_estimate = priori_estimate + gain * (measurement - priori_estimate)
        self.posteri_error_estimate = (1 - gain) * priori_error_estimate
        return self.posteri_estimate

class KalmanFilter2D:
    def __init__(self):
        self.kf_x = KalmanFilter1D()
        self.kf_y = KalmanFilter1D()

    def update(self, x, y):
        return self.kf_x.update(x), self.kf_y.update(y)
