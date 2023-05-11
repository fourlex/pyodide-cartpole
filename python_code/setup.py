from setuptools import setup, find_packages

setup(
    name='cartpole',
    version='0.0.1',
    install_requires=[
        'numpy',
        'scipy'
    ],
    packages=find_packages()
)