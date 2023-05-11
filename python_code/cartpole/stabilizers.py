import numpy as np
from scipy.signal import place_poles
from scipy.linalg import solve_continuous_are


class FullStateFeedbackStabilizer():
    def __init__(self, A, B, poles=None):
        if poles is None:
            poles = -np.random.uniform(-1, 0, A.shape[0])
        self.K = place_poles(A, B.reshape(-1, 1), poles).gain_matrix
        self.K = self.K.reshape(1, -1)

    def __call__(self, x):
        return -np.dot(self.K, np.asarray(x))[0]


class LQRStabilizer():
    def __init__(self, A, B, Q=None, R=None):
        if Q is None:
            Q = np.eye(A.shape[1])
        if R is None:
            R = np.eye(B.shape[1])
        P = solve_continuous_are(A, B, Q, R)
        self.K = np.linalg.inv(R) @ B.T @ P

    def __call__(self, x):
        return -np.dot(self.K, np.asarray(x))[0]
