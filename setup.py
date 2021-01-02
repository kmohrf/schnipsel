from os import path
from setuptools import setup, find_packages

from schnipsel import __version__

BASE_DIR = path.realpath(path.dirname(__file__))

setup(
    name="schnipsel",
    version=__version__,
    description="digital sticky note board",
    url="https://git.hack-hro.de/kmohrf/schnipsel",
    author="Konrad Mohrfeldt",
    author_email="konrad.mohrfeldt@farbdev.org",
    packages=find_packages(),
    install_requires=(
        "django>=2.2<3.0",
        "djangorestframework>=3.9<4.0",
        "django-filter>=2.1.0<3.0",
        "django-imagekit>=4.0.2<5.0",
        "django-reversion>=3.0<4.0",
        "pillow",
    ),
    extras_require={"monitoring": ("sentry-sdk[django]")},
    include_package_data=True,
)
