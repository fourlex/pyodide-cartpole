import numpy as np


class LinearSystem:
    def __init__(self,
                 A, B,
                 max_step=0.05,
                ):
        self.A = A
        self.B = B

    def dstate_dt(self, state, u):
        return (self.A @ state.reshape(-1, 1) + self.B * u).ravel()

    def linearized_matrices(self):
        return self.A, self.B

    def equilibrum(self):
        return np.zeros(self.A.shape[1])
    

class TwoCartsPendulum:
    def __init__(self,
                 mu=10,           # жесткость пружины
                 g=9.81,         # ускорение свободного падения
                 k=0.01 ,        # коэффициент вязкого трения
                 M1=0.3,         # масса первой тележки
                 M2=0.5,         # масса второй тележки
                 m=0.1,          # масса маятника
                 l=0.3,          # длина маятника
                 L=1,          # длина нерастянутой пружины
                ):
        self.params = (mu, g, k, M1, M2, m, l, L)

    def dstate_dt(self, state, u):
        mu, g, k, M1, M2, m, l, L = self.params
        x1, x2, th, v1, v2, w = state

        lhs = np.array([
            [M1, 0, 0],
            [0, M2 + m, m * l * np.cos(th)],
            [0, m * l * np.cos(th), m * l**2]
        ])    
        rhs = np.array([
            mu * (x2 - x1 - L) - k * v1 + u,
            -mu * (x2 - x1 - L) - k * v2 + m * l * w**2 * np.sin(th),
            -m * g * l * np.sin(th)
        ])
        dx1_dx2_dth = np.array([v1, v2, w])
        dv1_dv2_dw = np.linalg.solve(lhs, rhs)
        return np.hstack([dx1_dx2_dth, dv1_dv2_dw])

    def linearized_matrices(self):
        mu, g, k, M1, M2, m, l, L = self.params
        A = np.array([
            [0, 0, 0, 1, 0, 0],
            [0, 0, 0, 0, 1, 0],
            [0, 0, 0, 0, 0, 1],
            np.array([-mu, mu, 0, -k, 0, 0]) / M1,
            np.array([mu, -mu, g*m, 0, -k, 0]) / M2,
            np.array([mu, -mu, g*(M2 + m), 0, -k, 0]) / (M2 * l)
        ])
        B = np.array([0, 0, 0, 1/M1, 0, 0]).reshape(-1, 1)
        return A, B

    def equilibrum(self, s=0):
        mu, g, k, M1, M2, m, l, L = self.params
        return np.array([s, L + s, np.pi, 0, 0, 0])
