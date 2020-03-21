import os
import distutils.log
from distutils.cmd import Command
from setuptools import setup
from setuptools.command.build_py import build_py
import subprocess

from schnipsel import VERSION

BASE_DIR = os.path.realpath(os.path.dirname(__file__))


class BuildAssetsCommand(Command):
    description = "build and collect assets"

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def run(self):
        app_path = os.path.join(BASE_DIR, "app")
        python_bin = (
            os.path.join(os.environ["VIRTUAL_ENV"], "bin", "python")
            if "VIRTUAL_ENV" in os.environ
            else "/usr/bin/python3"
        )
        self.announce(
            "Installing web app dependencies with npm", level=distutils.log.INFO
        )
        subprocess.check_call(
            ["env", "-i", f"PATH={os.environ['PATH']}", "npm", "ci", "--no-progress"],
            cwd=app_path,
            env={"ADBLOCK": "true",},
        )
        self.announce("Building web app with npm", level=distutils.log.INFO)
        subprocess.check_call(
            ["env", "-i", f"PATH={os.environ['PATH']}", "npm", "run", "build"],
            cwd=app_path,
            env={"PATH": os.environ["PATH"]},
        )
        self.announce("Collecting assets for Django", level=distutils.log.INFO)
        subprocess.check_call(
            [python_bin, "-m", "schnipsel", "collectstatic", "--no-input", "--clear",],
            cwd=BASE_DIR,
            env={"SCHNIPSEL_SECRET_KEY": "packaging"},
        )


class ExtendedBuildPyCommand(build_py):
    def run(self):
        self.run_command("assets")
        super().run()


setup(
    name="schnipsel",
    version=VERSION,
    description="digital sticky note board",
    url="https://git.hack-hro.de/kmohrf/schnipsel",
    author="Konrad Mohrfeldt",
    author_email="konrad.mohrfeldt@farbdev.org",
    packages=("schnipsel",),
    install_requires=(
        "django>=2.2<3.0",
        "djangorestframework>=3.9<4.0",
        "django-reversion>=3.0<4.0",
        "django-filter>=2.1.0<3.0",
    ),
    extras_require={"monitoring": ("sentry-sdk[django]")},
    include_package_data=True,
    cmdclass={"build_py": ExtendedBuildPyCommand, "assets": BuildAssetsCommand},
)
